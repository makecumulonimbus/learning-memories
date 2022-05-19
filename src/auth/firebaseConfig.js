import firebase from 'firebase';
import "firebase/firestore"
import "firebase/auth"

var firebaseConfig = {
    apiKey: "AIzaSyAQawMMSKzP4zWusvOAIy10wJ0DBFlKrIg",
    authDomain: "learning-memories.firebaseapp.com",
    projectId: "learning-memories",
    storageBucket: "learning-memories.appspot.com",
    messagingSenderId: "828405969497",
    appId: "1:828405969497:web:fb82afacd564e494fdf748",
    measurementId: "G-S3H6T0FCTR"
};

const firebaseApp = firebase.initializeApp(firebaseConfig);

export default firebaseApp;