'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Email Sign Up
  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  // ✅ Email Login
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // ✅ Google Sign-In for Electron
  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    auth.useDeviceLanguage(); // Optional: sets to user's OS/browser language

    return await signInWithPopup(auth, provider);
  }

  // ✅ Logout
  function logout() {
    return signOut(auth);
  }

  // ✅ Track current user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    signInWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
