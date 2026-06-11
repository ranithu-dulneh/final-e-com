import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signInAnonymously, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

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

  const loginWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
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
