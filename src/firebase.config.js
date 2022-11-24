// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBB5kCXNEPWWRE1GVAJfHgzWNLl2wbwl2o',

  authDomain: 'house-market-place-app-70b39.firebaseapp.com',

  projectId: 'house-market-place-app-70b39',

  storageBucket: 'house-market-place-app-70b39.appspot.com',

  messagingSenderId: '106344664540',

  appId: '1:106344664540:web:17c365880482bd8aa99319',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const db = getFirestore()
