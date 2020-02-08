import React, { createContext, useState, useEffect } from "react";
import firebase from "firebase/app";
import "firebase/analytics";
import "firebase/performance";
import { firebaseConfig } from "../scripts/reduxFirebaseStore";

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

export const FirebaseContext = createContext({});

export const FirebaseProvider = ({ children }) => {
  const [state, setState] = useState({});

  useEffect(() => {
    setState({
      perf: firebase.performance(),
      analytics: firebase.analytics()
    });
  }, []);

  return (
    <FirebaseContext.Provider value={state}>
      {children}
    </FirebaseContext.Provider>
  );
};

export default FirebaseProvider;
