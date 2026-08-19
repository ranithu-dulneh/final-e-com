
import { useState, useEffect } from "react";
import { db, storage } from "../firebase";
import { ref, get, push, set } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import Navbar from "../components/Navbar";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  User,
  Award,
  UploadCloud,
  FileText,
  X,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const Careers = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [mobile, setMobile] = useState("");
  const [age, setAge] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [experienceDetails, setExperienceDetails] = useState("");
  const [cvFile, setCvFile] = useState(null);
  const [cvUrl, setCvUrl] = useState("");

  // UI states
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const snapshot = await get(ref(db, "careers/jobs"));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const jobsList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setJobs(jobsList);
      } else {
        setJobs([]);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchJobs();
  }, []);

  const handleCvChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCvFile(file);
    setIsUploadingCv(true);
    setErrorMsg("");

    try {
      const fileRef = storageRef(storage, `careers/cvs/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(fileRef, file);
      const url = await getDownloadURL(snapshot.ref);
      setCvUrl(url);
    } catch (err) {
      console.error("Error uploading CV:", err);
      setErrorMsg("Failed to upload CV. Please try again.");
      setCvFile(null);
    } finally {
      setIsUploadingCv(false);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();

    if (!name || !address || !mobile || !age || !experienceYears || !cvUrl) {
      setErrorMsg("Please fill in all fields and ensure your CV is uploaded.");
      return;
    }

    const parsedAge = parseInt(age);
    const parsedExp = parseInt(experienceYears);

    if (isNaN(parsedAge) || parsedAge <= 0) {
      setErrorMsg("Please enter a valid age.");
      return;
    }

    if (isNaN(parsedExp) || parsedExp < 0) {
      setErrorMsg("Please enter a valid number of years of experience.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const newAppRef = push(ref(db, "careers/applications"));
      const applicationData = {
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        name,
        address,
        mobile,
        age: parsedAge,
        experienceYears: parsedExp,
        experienceDetails: experienceDetails || "No additional experience details provided.",
        cvUrl,
        cvName: cvFile ? cvFile.name : "CV_Uploaded",
        createdAt: new Date().toISOString()
      };

      await set(newAppRef, applicationData);
      setSubmitSuccess(true);
      resetForm();
    } catch (err) {
      console.error("Error submitting application:", err);
      setErrorMsg("Error submitting your application: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setAddress("");
    setMobile("");
    setAge("");
    setExperienceYears("");
    setExperienceDetails("");
    setCvFile(null);
    setCvUrl("");
    setErrorMsg("");
  };

  const openApplyModal = (job) => {
    setSelectedJob(job);
    setIsApplyModalOpen(true);
    setSubmitSuccess(false);
    resetForm();
  };

  const closeApplyModal = () => {
    setIsApplyModalOpen(false);
    setSelectedJob(null);
  };

  return (
    <div className="min-h-screen bg-off-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div



          className="max-w-4xl mx-auto"
        >
          {/* Header section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6">
              Join Our Team
            </h1>
            <div className="w-24 h-1 bg-gold-500 mx-auto mb-8"></div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              We are always on the lookout for talented, passionate, and driven individuals
              who want to make an impact in the luxury jewelry e-commerce space. Explore open positions below.
            </p>
          </div>

          {/* Job Listings List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 mt-4 font-serif">Loading open positions...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white p-12 text-center border border-gray-100 shadow-sm rounded-sm">
              <Briefcase className="mx-auto text-gray-300 mb-4" size={48} />
              <h3 className="text-xl font-serif text-gray-800 mb-2">No Open Positions</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                We don't have any specific job listings active right now, but we are always eager to meet talent. Check back soon or feel free to reach out via our contact page.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  whileHover={{ y: -2 }}
                  className="bg-white p-6 md:p-8 shadow-sm border border-gray-100 hover:border-gold-500/50 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                >
                  <div className="space-y-4 flex-grow">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-serif text-gray-900 font-medium">
                        {job.title}
                      </h2>
                      <span className="px-3 py-1 bg-gold-50 text-gold-600 border border-gold-200 text-xs uppercase tracking-widest font-semibold rounded-full">
                        {job.type}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} className="text-gold-600" />
                        <span>Salary: {job.salary}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-gold-600" />
                        <span>Location: Sri Lanka (Remote / Hybrid)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gold-600" />
                        <span>Min Age Requirement: {job.minAge} years</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award size={16} className="text-gold-600" />
                        <span>Min Experience: {job.minExperience} years</span>
                      </div>
                    </div>

                    {job.description && (
                      <p className="text-gray-600 text-sm border-t border-gray-100 pt-3">
                        {job.description}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => openApplyModal(job)}
                    className="w-full md:w-auto bg-black text-white hover:bg-gold-600 px-6 py-3 uppercase tracking-widest text-xs font-semibold transition-all shadow-sm shrink-0"
                  >
                    Apply Now
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Application Modal */}
      <AnimatePresence>
        {isApplyModalOpen && selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <div




              className="bg-white w-full max-w-2xl rounded-sm shadow-2xl overflow-hidden my-8"
            >
              {/* Modal Header */}
              <div className="bg-black text-white px-6 py-5 flex justify-between items-center">
                <div>
                  <span className="text-xs uppercase tracking-widest text-gold-400 font-semibold block mb-1">Applying For</span>
                  <h3 className="font-serif text-xl">{selectedJob.title}</h3>
                </div>
                <button
                  onClick={closeApplyModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 md:p-8 max-h-[80vh] overflow-y-auto">
                {submitSuccess ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200">
                      <CheckCircle size={36} />
                    </div>
                    <h4 className="text-2xl font-serif text-gray-900">Application Submitted!</h4>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Thank you for applying for the <strong>{selectedJob.title}</strong> position. Our HR team will review your CV and qualifications. We'll be in touch soon.
                    </p>
                    <button
                      onClick={closeApplyModal}
                      className="mt-6 bg-black text-white hover:bg-gold-600 px-8 py-3 uppercase tracking-widest text-xs font-semibold transition-colors"
                    >
                      Close Window
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplySubmit} className="space-y-6">
                    {/* Job Minimum Requirements Reminder */}
                    <div className="bg-gold-50/50 border border-gold-200/50 p-4 text-xs text-gray-700 flex items-start gap-3">
                      <AlertCircle size={16} className="text-gold-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold uppercase tracking-wider block mb-1">Minimum Requirements:</span>
                        <ul className="list-disc pl-4 space-y-1">
                          <li>Minimum Age: <strong>{selectedJob.minAge}</strong> years old</li>
                          <li>Minimum Experience: <strong>{selectedJob.minExperience}</strong> years in the field</li>
                        </ul>
                      </div>
                    </div>

                    {errorMsg && (
                      <div className="p-4 bg-red-50 text-red-600 text-sm flex items-center gap-3 border border-red-200">
                        <AlertCircle size={18} />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Jane Doe"
                          className="w-full px-4 py-2.5 border border-gray-300 focus:border-gold-500 outline-none text-sm transition-colors rounded-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                          Mobile Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          placeholder="e.g. 070 750 6269"
                          className="w-full px-4 py-2.5 border border-gray-300 focus:border-gold-500 outline-none text-sm transition-colors rounded-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                          Age *
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          max="120"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          placeholder="e.g. 25"
                          className="w-full px-4 py-2.5 border border-gray-300 focus:border-gold-500 outline-none text-sm transition-colors rounded-none"
                        />
                        {age && parseInt(age) < parseInt(selectedJob.minAge) && (
                          <p className="text-red-500 text-xs mt-1 font-medium">
                            Note: Does not meet minimum age of {selectedJob.minAge}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                          Years of Experience *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          max="50"
                          value={experienceYears}
                          onChange={(e) => setExperienceYears(e.target.value)}
                          placeholder="e.g. 2"
                          className="w-full px-4 py-2.5 border border-gray-300 focus:border-gold-500 outline-none text-sm transition-colors rounded-none"
                        />
                        {experienceYears && parseInt(experienceYears) < parseInt(selectedJob.minExperience) && (
                          <p className="text-red-500 text-xs mt-1 font-medium">
                            Note: Does not meet minimum experience of {selectedJob.minExperience} years
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                        Residential Address *
                      </label>
                      <textarea
                        required
                        rows="2"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="123 Galle Road, Colombo"
                        className="w-full px-4 py-2.5 border border-gray-300 focus:border-gold-500 outline-none text-sm transition-colors rounded-none resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                        Describe your Experience in this Field (Optional)
                      </label>
                      <textarea
                        rows="3"
                        value={experienceDetails}
                        onChange={(e) => setExperienceDetails(e.target.value)}
                        placeholder="Tell us about your past roles, skills, or why you are a great fit."
                        className="w-full px-4 py-2.5 border border-gray-300 focus:border-gold-500 outline-none text-sm transition-colors rounded-none resize-none"
                      />
                    </div>

                    {/* CV Upload */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                        Upload CV (PDF, DOCX, etc.) *
                      </label>

                      <div className="border-2 border-dashed border-gray-300 hover:border-gold-500/50 p-6 text-center transition-colors relative bg-gray-50/50">
                        {isUploadingCv ? (
                          <div className="space-y-2 py-2 flex flex-col items-center">
                            <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-xs text-gray-500 font-medium">Uploading file to secure cloud...</p>
                          </div>
                        ) : cvUrl ? (
                          <div className="flex items-center justify-center gap-3 text-green-600">
                            <FileText size={28} />
                            <div className="text-left">
                              <p className="text-sm font-medium">{cvFile ? cvFile.name : "CV Uploaded"}</p>
                              <p className="text-xs text-gray-400">Successfully uploaded</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => { setCvUrl(""); setCvFile(null); }}
                              className="text-red-500 hover:text-red-700 ml-4"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer block py-2">
                            <UploadCloud className="mx-auto text-gray-400 mb-2" size={32} />
                            <span className="text-xs font-medium text-gold-600 hover:text-gold-700 underline block mb-1">
                              Click to select file
                            </span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                              PDF, DOCX, DOC, PNG, JPG (Max 10MB)
                            </span>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                              onChange={handleCvChange}
                              className="hidden"
                              required={!cvUrl}
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || isUploadingCv}
                      className="w-full bg-black text-white py-3 uppercase tracking-widest text-xs font-semibold hover:bg-gold-600 transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? "Submitting Application..." : "Submit Application"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Careers;
