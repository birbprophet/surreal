import React, { useEffect, useState } from "react";
import Head from "next/head";
import Router from "next/router";

import { useSelector } from "react-redux";
import { useFirebase, isLoaded, isEmpty } from "react-redux-firebase";

import LoadingModal from "../components/LoadingModal";

const Page: React.FC = () => {
  const firebase = useFirebase();
  const [state, setState] = useState({ isLoading: false });
  const auth = useSelector(state => state.firebase.auth);

  const profile = useSelector(state => state.firebase.profile);

  useEffect(() => {
    if (isLoaded(auth) && isEmpty(auth)) {
      Router.push("/login");
    }
    setState({ ...state, isLoading: !isLoaded(auth) });
  }, [auth]);

  const handleLogout = () => firebase.logout();

  return (
    <>
      <Head>
        <title>surreal</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {state.isLoading && <LoadingModal />}
      Profile Page
      <button onClick={handleLogout}>Logout</button>
    </>
  );
};

export default Page;
