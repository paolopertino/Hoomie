import firebase from 'firebase'

// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyBszKLx5-9CwbP-m4gTNH_EH9Qlh351ctY",
    authDomain: "hoomie-cdf.firebaseapp.com",
    projectId: "hoomie-cdf",
    storageBucket: "hoomie-cdf.appspot.com",
    messagingSenderId: "969503045252",
    appId: "1:969503045252:web:5e0fa74a2e139113c5f4d1"
};
// Initialize Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);
firebaseApp.firestore().settings({ timestampsInSnapshots: true })

export default firebaseApp.firestore()