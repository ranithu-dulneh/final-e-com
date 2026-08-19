/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signInAnonymously, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";

const AuthContext = createContext();

const useAuth = () => useContext(AuthContext);
export { useAuth };

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email, password, username) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (username) {
      await updateProfile(userCredential.user, {
        displayName: username
      });
    }
    return userCredential;
  };

  const loginAnonymously = () => {
    return signInAnonymously(auth);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      return await signInWithPopup(auth, provider);
    } catch (error) {
      if (error.code === 'auth/unauthorized-domain') {
        console.warn("Firebase Auth Error: Your current domain is not authorized for OAuth operations. Please go to the Firebase Console -> Authentication -> Settings -> Authorized domains, and add this domain (e.g., localhost or your Vercel URL).");
      }
      throw error;
    }
  };

  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  const logout = () => {
    return signOut(auth);
  };

  const value = {
    currentUser,
    login,
    signup,
    loginAnonymously,
    loginWithGoogle,
    resetPassword,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
