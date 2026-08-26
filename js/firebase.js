import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    getStorage
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDv_Y42hJJoY8Q0XvgHeS9iVGFk5ahvL2o",
  authDomain: "kwkma-test.firebaseapp.com",
  projectId: "kwkma-test",
  storageBucket: "kwkma-test.firebasestorage.app",
  messagingSenderId: "994162587295",
  appId: "1:994162587295:web:be5e99a65f03e25005d4aa",
  measurementId: "G-Y60946CDM6"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const storage = getStorage(app);


export {
    auth,
    db,
    storage
};

