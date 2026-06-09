commit 0c290e434a3f0f763f3b4ca6ec33a18e19480f0a
Author: google-labs-jules[bot] <161369871+google-labs-jules[bot]@users.noreply.github.com>
Date:   Tue Jun 9 19:06:24 2026 +0000

    feat: Add popup ads and per-product recommendations

diff --git a/src/pages/AdminPanel.jsx b/src/pages/AdminPanel.jsx
index 2191dbe..5d320fc 100644
--- a/src/pages/AdminPanel.jsx
+++ b/src/pages/AdminPanel.jsx
@@ -134,6 +134,9 @@ const AdminPanel = () => {
   const [instructions, setInstructions] = useState("");
   const [couponCode, setCouponCode] = useState("");
   const [couponDiscount, setCouponDiscount] = useState("");
+  const [relatedProducts, setRelatedProducts] = useState([]);
+  const [relatedSearchTerm, setRelatedSearchTerm] = useState("");
+  const [relatedSearchResults, setRelatedSearchResults] = useState([]);
   const [uploading, setUploading] = useState(false);
   const [fileUploading, setFileUploading] = useState(false);
   const [editMode, setEditMode] = useState(false);
@@ -310,7 +313,8 @@ const AdminPanel = () => {
         commitments: commitments,
         allowedPayments: allowedPayments,
         couponCode: couponCode || "",
-        couponDiscount: couponDiscount || 0
+        couponDiscount: couponDiscount || 0,
+        relatedProducts: relatedProducts,
       };

       if (editMode) {
@@ -375,6 +379,34 @@ const AdminPanel = () => {
       }
   }, [recSearchTerm, products, recommendedProducts]);

+
+  useEffect(() => {
+      if (relatedSearchTerm.trim() === "") {
+          setRelatedSearchResults([]);
+      } else {
+          const query = relatedSearchTerm.toLowerCase();
+          const results = products.filter(p =>
+              p.title.toLowerCase().includes(query) &&
+              !relatedProducts.includes(p.id) &&
+              p.id !== editingId
+          ).slice(0, 5);
+          setRelatedSearchResults(results);
+      }
+  }, [relatedSearchTerm, products, relatedProducts, editingId]);
+
+  const handleAddRelated = (product) => {
+      if (relatedProducts.length >= 6) {
+          alert("Maximum 6 related products allowed per product.");
+          return;
+      }
+      setRelatedProducts([...relatedProducts, product.id]);
+      setRelatedSearchTerm("");
+  };
+
+  const handleRemoveRelated = (idToRemove) => {
+      setRelatedProducts(relatedProducts.filter(id => id !== idToRemove));
+  };
+
   const handleAddRecommended = (product) => {
       if (recommendedProducts.length >= 6) {
           alert("Maximum 6 recommended products allowed.");
@@ -443,6 +475,9 @@ const AdminPanel = () => {
     setInstructions("");
     setCouponCode("");
     setCouponDiscount("");
+    setRelatedProducts([]);
+    setRelatedSearchTerm("");
+    setRelatedSearchResults([]);
     setEditMode(false);
     setEditingId(null);
   };
@@ -511,6 +546,7 @@ const AdminPanel = () => {

     setCouponCode(product.couponCode || "");
     setCouponDiscount(product.couponDiscount || "");
+    setRelatedProducts(product.relatedProducts || []);

     window.scrollTo({ top: 0, behavior: 'smooth' });
   };
@@ -1007,6 +1043,65 @@ const AdminPanel = () => {
               >
                 {uploading ? 'Processing...' : (editMode ? 'Update Product' : 'Add Product')}
               </button>
+
+                {/* Related Products Section */}
+                <div className="mt-8 border-t border-gray-200 pt-6">
+                    <h3 className="text-sm font-medium text-gray-700 mb-4">Related Products (Max 6)</h3>
+                    <p className="text-xs text-gray-500 mb-4">These will show at the bottom of the product page instead of the global recommendations.</p>
+
+                    <div className="relative mb-4">
+                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
+                        <input
+                            type="text"
+                            placeholder="Search to add related product..."
+                            value={relatedSearchTerm}
+                            onChange={(e) => setRelatedSearchTerm(e.target.value)}
+                            className="w-full pl-9 pr-4 py-2 border border-gray-300 focus:border-gold-500 outline-none text-sm"
+                        />
+                        {relatedSearchResults.length > 0 && (
+                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 shadow-lg max-h-48 overflow-y-auto">
+                                {relatedSearchResults.map(prod => (
+                                    <div
+                                        key={prod.id}
+                                        onClick={() => handleAddRelated(prod)}
+                                        className="flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
+                                    >
+                                        <div className="w-8 h-8 bg-gray-100 flex-shrink-0">
+                                            {prod.imageUrl && (
+                                                <img src={Array.isArray(prod.imageUrl) ? prod.imageUrl[0] : prod.imageUrl} alt={prod.title} className="w-full h-full object-cover" />
+                                            )}
+                                        </div>
+                                        <div className="flex-1 min-w-0">
+                                            <p className="text-sm text-gray-900 truncate">{prod.title}</p>
+                                        </div>
+                                    </div>
+                                ))}
+                            </div>
+                        )}
+                    </div>
+
+                    {relatedProducts.length > 0 && (
+                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
+                            {relatedProducts.map(relId => {
+                                const prod = products.find(p => p.id === relId);
+                                if (!prod) return null;
+                                return (
+                                    <div key={relId} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 text-sm">
+                                        <span className="truncate pr-2">{prod.title}</span>
+                                        <button
+                                            type="button"
+                                            onClick={() => handleRemoveRelated(relId)}
+                                            className="text-red-500 hover:text-red-700"
+                                        >
+                                            <X size={14} />
+                                        </button>
+                                    </div>
+                                );
+                            })}
+                        </div>
+                    )}
+                </div>
+
             </form>
           </div>
         </div>
@@ -1171,7 +1266,8 @@ const AdminPanel = () => {
                                     </div>
                                 </div>

-                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
+
+<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                     {/* Customer Info */}
                                     <div>
                                         <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2">Customer Details</h4>
