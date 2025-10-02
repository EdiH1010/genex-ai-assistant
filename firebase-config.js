// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// --- NEW: Asynchronous function to initialize Firebase ---
async function initializeFirebase() {
  // Fetch the configuration from our server's endpoint
  const response = await fetch('/firebase-config');
  const firebaseConfig = await response.json();

  // Initialize Firebase with the fetched config
  const app = initializeApp(firebaseConfig);
  
  // Return the auth service
  return getAuth(app);
}

// Export a promise that resolves with the auth service
export const authPromise = initializeFirebase();