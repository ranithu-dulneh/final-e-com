import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setMessage("");
      setError("");
      setLoading(true);
      await resetPassword(email);
      setMessage("Check your inbox for further instructions");
    } catch (err) {
      setError("Failed to reset password. " + err.message);
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-off-white px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-serif text-center mb-8">Reset Password</h2>

        {error && <div className="bg-red-50 text-red-600 p-3 text-sm mb-4 text-center">{error}</div>}
        {message && <div className="bg-green-50 text-green-600 p-3 text-sm mb-4 text-center">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gold-500 transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-black text-white py-3 uppercase tracking-widest hover:bg-gold-600 transition-colors duration-300 text-sm disabled:bg-gray-400"
          >
            Reset Password
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-gray-500 hover:text-black uppercase tracking-wider transition-colors">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
