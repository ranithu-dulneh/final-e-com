import common from "oci-common";
import os from "oci-objectstorage";
import Busboy from "busboy";
import { v4 as uuidv4 } from "uuid";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Check if required environment variables are present
  const requiredEnvVars = [
    "OCI_TENANCY",
    "OCI_USER",
    "OCI_FINGERPRINT",
    "OCI_PRIVATE_KEY",
    "OCI_REGION",
    "OCI_NAMESPACE",
    "OCI_BUCKET_NAME",
  ];

  const missingEnvVars = requiredEnvVars.filter((v) => !process.env[v]);
  if (missingEnvVars.length > 0) {
    console.error(`Missing OCI environment variables: ${missingEnvVars.join(", ")}`);
    return res.status(500).json({
      error: "Server configuration error: Missing OCI credentials.",
      missing: missingEnvVars,
    });
  }

  try {
    // Set up OCI authentication using environment variables
    const provider = new common.SimpleAuthenticationDetailsProvider(
      process.env.OCI_TENANCY,
      process.env.OCI_USER,
      process.env.OCI_FINGERPRINT,
      // The private key might contain literal '\n' characters if stored in Vercel UI
      process.env.OCI_PRIVATE_KEY.replace(/\\n/g, "\n"),
      null, // passphrase
      common.Region[process.env.OCI_REGION.replace(/-/g, "_").toUpperCase()] || process.env.OCI_REGION
    );

    const client = new os.ObjectStorageClient({ authenticationDetailsProvider: provider });

    // Parse the multipart form data using busboy
    const busboy = Busboy({ headers: req.headers });

    let uploadPromise = new Promise((resolve, reject) => {
      let fileProcessed = false;

      busboy.on("file", async (fieldname, file, filename, encoding, mimetype) => {
        fileProcessed = true;

        // Ensure we extract the actual filename string correctly based on Busboy version
        const actualFilename = typeof filename === 'object' && filename.filename ? filename.filename : filename;
        const extension = actualFilename.split('.').pop() || 'png';
        const objectName = `products/${uuidv4()}.${extension}`;

        const chunks = [];
        file.on("data", (data) => chunks.push(data));

        file.on("end", async () => {
          const buffer = Buffer.concat(chunks);

          try {
            const putObjectRequest = {
              namespaceName: process.env.OCI_NAMESPACE,
              bucketName: process.env.OCI_BUCKET_NAME,
              putObjectBody: buffer,
              objectName: objectName,
              contentType: typeof filename === 'object' && filename.mimeType ? filename.mimeType : "application/octet-stream",
            };

            await client.putObject(putObjectRequest);

            // Construct the public URL
            // Format: https://objectstorage.<region>.oraclecloud.com/n/<namespace>/b/<bucket>/o/<objectName>
            const region = process.env.OCI_REGION;
            const namespace = process.env.OCI_NAMESPACE;
            const bucket = process.env.OCI_BUCKET_NAME;
            const publicUrl = `https://objectstorage.${region}.oraclecloud.com/n/${encodeURIComponent(namespace)}/b/${encodeURIComponent(bucket)}/o/${encodeURIComponent(objectName)}`;

            resolve({ url: publicUrl });
          } catch (error) {
            console.error("OCI Upload Error:", error);
            reject(error);
          }
        });
      });

      busboy.on("finish", () => {
        if (!fileProcessed) {
          reject(new Error("No file found in the request."));
        }
      });

      busboy.on("error", (error) => reject(error));
    });

    req.pipe(busboy);

    const result = await uploadPromise;
    return res.status(200).json(result);
  } catch (error) {
    console.error("Upload handler error:", error);
    return res.status(500).json({ error: error.message || "Failed to upload file." });
  }
}
