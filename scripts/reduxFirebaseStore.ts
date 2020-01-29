import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import { createStore, combineReducers } from "redux";
import { firebaseReducer } from "react-redux-firebase";
import { createFirestoreInstance, firestoreReducer } from "redux-firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCVN1mOjiqM1aw_SmJtrOCIiGZxnGH5C7I",
  authDomain: "surreal-d0311.firebaseapp.com",
  databaseURL: "https://surreal-d0311.firebaseio.com",
  projectId: "surreal-d0311",
  storageBucket: "surreal-d0311.appspot.com",
  messagingSenderId: "830632288598",
  appId: "1:830632288598:web:96f3cb1cea32686eb036f7",
  measurementId: "G-EM67KBMMJY"
};

const rrfConfig = {
  userProfile: "users",
  useFirestoreForProfile: true
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

firebase.firestore();

const rootReducer = combineReducers({
  firebase: firebaseReducer,
  firestore: firestoreReducer
});

const initialState = {};

export const store = createStore(rootReducer, initialState);
export const rrfProps = {
  firebase,
  config: rrfConfig,
  dispatch: store.dispatch,
  createFirestoreInstance
};
