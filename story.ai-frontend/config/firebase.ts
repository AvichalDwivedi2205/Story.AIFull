import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Function to save assessment results to Firestore
export async function saveAssessmentResult(
  userId: string, 
  assessmentType: 'PSS' | 'Personality' | 'GAD', 
  data: any
) {
  try {
    const userRef = doc(db, "users", userId);
    
    // Create the assessment data structure with timestamp
    const assessmentData = {
      assessment: {
        [assessmentType]: {
          ...data,
          time: serverTimestamp()
        }
      }
    };
    
    // Update the user document with the assessment results
    await updateDoc(userRef, assessmentData);
    return true;
  } catch (error) {
    console.error("Error saving assessment result:", error);
    return false;
  }
}

export { auth, db };