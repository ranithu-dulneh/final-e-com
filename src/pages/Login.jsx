import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, register, loginWithGoogle, loginAsGuest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Admin emails or UIDs to navigate to Admin Panel
  const ADMIN_EMAIL = "ranithudulneth@gmail.com";
  const ADMIN_UID = "jHolNzdESvNZu2bIO8r06hS21Iu1";

  const handleRedirect = (user) => {
    if (user.email === ADMIN_EMAIL || user.uid === ADMIN_UID) {
      navigate("/admin");
    } else {
      // If user came from a specific page, could go back, else profile
      navigate("/profile");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) {
        const userCredential = await login(email, password);
        handleRedirect(userCredential.user);
      } else {
        const userCredential = await register(email, password);
        handleRedirect(userCredential.user);
      }
    } catch (err) {
      if (isLogin) {
        setError("Failed to sign in. Please check your credentials.");
      } else {
        setError("Failed to create an account. It may already exist or password is too weak.");
      }
      console.error(err);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    try {
      const userCredential = await loginWithGoogle();
      handleRedirect(userCredential.user);
    } catch (err) {
      setError("Failed to sign in with Google.");
      console.error(err);
    }
  };

  const handleGuestSignIn = async () => {
    setError("");
    try {
      const userCredential = await loginAsGuest();
      handleRedirect(userCredential.user);
    } catch (err) {
      setError("Failed to continue as guest.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-off-white px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 shadow-sm border border-gray-100">
        <div className="text-center mb-8">
            <img src="/logo.png" alt="ZAFIRA" className="h-16 mx-auto mb-4" />
        </div>

        <div className="flex justify-center mb-6 border-b border-gray-200">
          <button
            className={`pb-2 px-4 uppercase tracking-widest text-sm font-medium transition-colors ${isLogin ? 'border-b-2 border-gold-500 text-black' : 'text-gray-400 hover:text-black'}`}
            onClick={() => { setIsLogin(true); setError(""); }}
          >
            Login
          </button>
          <button
            className={`pb-2 px-4 uppercase tracking-widest text-sm font-medium transition-colors ${!isLogin ? 'border-b-2 border-gold-500 text-black' : 'text-gray-400 hover:text-black'}`}
            onClick={() => { setIsLogin(false); setError(""); }}
          >
            Register
          </button>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 text-sm mb-4 text-center">{error}</div>}

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
          <button
            type="submit"
            className="w-full bg-black text-white py-3 uppercase tracking-widest hover:bg-gold-600 transition-colors duration-300 text-sm"
          >
            {isLogin ? "Sign In" : "Register"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between">
          <span className="border-b w-1/5 lg:w-1/4"></span>
          <span className="text-xs text-center text-gray-500 uppercase tracking-widest">Or continue with</span>
          <span className="border-b w-1/5 lg:w-1/4"></span>
        </div>

        <div className="mt-6 space-y-4">
          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-white text-gray-700 border border-gray-300 py-3 uppercase tracking-widest hover:bg-gray-50 transition-colors duration-300 text-sm flex justify-center items-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                <path fill="none" d="M1 1h22v22H1z"/>
            </svg>
            Google
          </button>
          <button
            onClick={handleGuestSignIn}
            className="w-full bg-gray-100 text-gray-700 py-3 uppercase tracking-widest hover:bg-gray-200 transition-colors duration-300 text-sm"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
