import firebase from "firebase/app";
import "firebase/auth";
import "firebase/storage";
import "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDS7xhEUGOo4PvBSZRFwNkeDqNii_qwQvI",
  authDomain: "slack-chat-d33a7.firebaseapp.com",
  databaseURL: "https://slack-chat-d33a7.firebaseio.com",
  projectId: "slack-chat-d33a7",
  storageBucket: "slack-chat-d33a7.appspot.com",
  messagingSenderId: "721956808096",
  appId: "1:721956808096:web:6f22e966d91a426a1e30c5",
  measurementId: "G-JK6MEF53LP",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
export default firebase;
