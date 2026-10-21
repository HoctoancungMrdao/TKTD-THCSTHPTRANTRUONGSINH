import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBFZZLTO6tXGsxL98BtXHLCw_VV5jUB3vU",
  authDomain: "quanlytktd.firebaseapp.com",
  databaseURL: "https://quanlytktd-default-rtdb.firebaseio.com",
  projectId: "quanlytktd",
  storageBucket: "quanlytktd.firebasestorage.app",
  messagingSenderId: "342514131785",
  appId: "1:342514131785:web:a4b31f62bab9c227d5f098"
};

// Khởi tạo Firebase App
const app = initializeApp(firebaseConfig);

// Khởi tạo Realtime Database
export const db = getDatabase(app);
