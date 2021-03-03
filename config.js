import *  as firebase from 'firebase' 
require ('@firebase/firestore')
var firebaseConfig = {
    apiKey: "AIzaSyD4gLnEeqUHq7L1fxNjiqvUHGdVcYaW3fI",
    authDomain: "wily-5a47b.firebaseapp.com",
    databaseURL:"https://wily-5a47b.firebaseio.com",
    projectId: "wily-5a47b",
    storageBucket: "wily-5a47b.appspot.com",
    messagingSenderId: "508990918771",
    appId: "1:508990918771:web:53139aa02c5730d3b71a06"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  export default firebase.firestore();