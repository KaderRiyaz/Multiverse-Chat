import { useEffect, useState } from "react";
import { getApps, initializeApp } from "firebase/app";
import { GoogleAuthProvider, RecaptchaVerifier, getAuth, onAuthStateChanged, signInWithPhoneNumber, signInWithPopup, signOut } from "firebase/auth";

const config = { apiKey: import.meta.env.VITE_FIREBASE_API_KEY, authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID, appId: import.meta.env.VITE_FIREBASE_APP_ID };

function getFirebaseAuth() {
  if (!config.apiKey || !config.authDomain || !config.projectId || !config.appId) throw new Error("Firebase is not configured. Add the VITE_FIREBASE_* variables to the client environment.");
  const app = getApps().length ? getApps()[0] : initializeApp(config);
  return getAuth(app);
}

export function useAuth() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      return onAuthStateChanged(getFirebaseAuth(), (next) => { setUser(next); setReady(true); });
    } catch (error) { console.error(error); setReady(true); }
  }, []);
  return { user, ready };
}

export async function signInWithGoogle() {
  return signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
}

export async function sendPhoneOtp(phone, containerId) {
  const auth = getFirebaseAuth();
  const verifier = new RecaptchaVerifier(auth, containerId, { size: "invisible" });
  return signInWithPhoneNumber(auth, phone, verifier);
}

export async function logout() {
  await signOut(getFirebaseAuth());
}
