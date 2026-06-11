import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      await signup(email, password, username);
      navigate("/profile");
    } catch (err) {
      setError("Failed to create an account. " + err.message);
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-off-white px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 shadow-sm border border-gray-100">
        <div className="text-center mb-8">
            <img src="/logo.png" alt="ZAFIRA" className="h-16 mx-auto mb-4" />
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 text-sm mb-4 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide mb-1">Username</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gold-500 transition-colors"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gold-500 transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide mb-1">Confirm Password</label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gold-500 transition-colors"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white py-3 uppercase tracking-widest hover:bg-gold-600 transition-colors duration-300 text-sm"
          >
            Sign Up
          </button>
        </form>

        <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-gray-500 hover:text-black uppercase tracking-wider transition-colors">
              Already have an account? Sign In
            </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
