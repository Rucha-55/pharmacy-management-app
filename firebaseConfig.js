// // // // Import the functions you need from the SDKs you need
// // // import { initializeApp } from "firebase/app";
// // // import { getAnalytics } from "firebase/analytics";
// // // import { getFirestore } from "firebase/firestore";

// // // // Your web app's Firebase configuration
// // // const firebaseConfig = {
// // //   apiKey: "AIzaSyAMM4Xyx9ksLsH4EwiECUIfsL6T3i-neSs",
// // //   authDomain: "pharmacy-app-8a65b.firebaseapp.com",
// // //   projectId: "pharmacy-app-8a65b",
// // //   storageBucket: "pharmacy-app-8a65b.appspot.com",
// // //   messagingSenderId: "352882175171",
// // //   appId: "1:352882175171:web:3599d69da7eb0ea4aac676",
// // //   measurementId: "G-CWBS6ZXV2J",
// // // };

// // // // Initialize Firebase
// // // const app = initializeApp(firebaseConfig);
// // // const analytics = getAnalytics(app);
// // // const db = getFirestore(app);

// // // export { app, analytics, db };

// // // Import required Firebase modules
// // import { initializeApp } from "firebase/app";
// // import { getFirestore } from "firebase/firestore";
// // import { initializeAuth, getReactNativePersistence } from "firebase/auth";
// // import AsyncStorage from "@react-native-async-storage/async-storage";

// // // Firebase configuration
// // const firebaseConfig = {
// //   apiKey: "AIzaSyAMM4Xyx9ksLsH4EwiECUIfsL6T3i-neSs",
// //   authDomain: "pharmacy-app-8a65b.firebaseapp.com",
// //   projectId: "pharmacy-app-8a65b",
// //   storageBucket: "pharmacy-app-8a65b.appspot.com",
// //   messagingSenderId: "352882175171",
// //   appId: "1:352882175171:web:3599d69da7eb0ea4aac676",
// //   measurementId: "G-CWBS6ZXV2J",
// // };

// // // Initialize Firebase
// // const app = initializeApp(firebaseConfig);

// // // Initialize Firestore
// // const db = getFirestore(app);

// // // Initialize Auth with AsyncStorage persistence
// // const auth = initializeAuth(app, {
// //   persistence: getReactNativePersistence(AsyncStorage),
// // });

// // export { app, db, auth };
// // Import required Firebase modules
// import { initializeApp } from "firebase/app"
// import { getFirestore } from "firebase/firestore"
// import { initializeAuth, getReactNativePersistence } from "firebase/auth"
// import AsyncStorage from "@react-native-async-storage/async-storage"

// // Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyAMM4Xyx9ksLsH4EwiECUIfsL6T3i-neSs",
//   authDomain: "pharmacy-app-8a65b.firebaseapp.com",
//   projectId: "pharmacy-app-8a65b",
//   storageBucket: "pharmacy-app-8a65b.appspot.com",
//   messagingSenderId: "352882175171",
//   appId: "1:352882175171:web:3599d69da7eb0ea4aac676",
//   measurementId: "G-CWBS6ZXV2J",
// }

// // Initialize Firebase
// const app = initializeApp(firebaseConfig)

// // Initialize Firestore
// const db = getFirestore(app)

// // Initialize Auth with AsyncStorage persistence
// const auth = initializeAuth(app, {
//   persistence: getReactNativePersistence(AsyncStorage),
// })

// export { app, db, auth }

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAMM4Xyx9ksLsH4EwiECUIfsL6T3i-neSs",
  authDomain: "pharmacy-app-8a65b.firebaseapp.com",
  projectId: "pharmacy-app-8a65b",
  storageBucket: "pharmacy-app-8a65b.appspot.com",
  messagingSenderId: "352882175171",
  appId: "1:352882175171:web:3599d69da7eb0ea4aac676",
  measurementId: "G-CWBS6ZXV2J",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export { app, db, auth, storage };