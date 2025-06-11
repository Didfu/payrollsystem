'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider, // Import GoogleAuthProvider
  signInWithPopup,    // Import signInWithPopup
} from 'firebase/auth';
import { auth } from '../lib/firebase'; // Assuming your firebase config and auth instance are here

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to sign up with email and password
  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  // Function to log in with email and password
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Function to sign in with Google
  function signInWithGoogle() {
    const provider = new GoogleAuthProvider(); // Create a new Google Auth Provider instance
    return signInWithPopup(auth, provider);    // Use signInWithPopup to trigger the Google sign-in flow
  }

  // Function to log out
  function logout() {
    return signOut(auth);
  }

  // Effect hook to listen for changes in authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user); // Set the current user
      setLoading(false);    // Set loading to false once auth state is determined
    });

    return unsubscribe; // Clean up the subscription when the component unmounts
  }, []); // Empty dependency array means this effect runs once on mount

  // The value object containing all authentication functions and current user
  const value = {
    currentUser,
    signup,
    login,
    signInWithGoogle, // Add signInWithGoogle to the context value
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children} {/* Render children only after authentication state is loaded */}
    </AuthContext.Provider>
  );
}