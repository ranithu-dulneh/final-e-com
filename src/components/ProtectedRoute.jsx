import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const ADMIN_EMAIL = "ranithudulneth@gmail.com";

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  const ADMIN_UID = "jHolNzdESvNZu2bIO8r06hS21Iu1";

  if (currentUser.email !== ADMIN_EMAIL && currentUser.uid !== ADMIN_UID) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-off-white">
        <div className="text-center p-8">
          <h2 className="text-2xl font-serif mb-4 text-red-600">Access Denied</h2>
          <p className="mb-4">You do not have permission to view this page.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="text-gold-600 underline hover:text-gold-700"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
