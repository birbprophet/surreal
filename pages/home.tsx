import React, { useEffect, useState } from "react";
import Head from "next/head";
import Router from "next/router";

import { useSelector } from "react-redux";
import { isLoaded, isEmpty } from "react-redux-firebase";

import LoadingModal from "../components/LoadingModal";

const Page: React.FC = () => {
  const [state, setState] = useState({ isLoading: true });
  const auth = useSelector(state => state.firebase.auth);
  const profile = useSelector(state => state.firebase.profile);
  useEffect(() => {
    if (isLoaded(auth) && isEmpty(auth)) {
      Router.push("/login");
    } else if (isLoaded(profile) && isEmpty(profile)) {
      Router.push("/welcome");
    }
    setState({ ...state, isLoading: !isLoaded(auth) || !isLoaded(profile) });
  }, [auth, profile]);

  return (
    <>
      <Head>
        <title>Surreal - Home</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {state.isLoading && <LoadingModal />}
      <div className="scrolling-touch">
        <div className="flex flex-col bg-white rounded-b-lg px-6 pt-6 shadow-lg"></div>
      </div>
    </>
  );
};

export default Page;
