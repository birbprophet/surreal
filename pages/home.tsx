import React, { useEffect, useState } from "react";
import Head from "next/head";
import Router from "next/router";

import { useSelector } from "react-redux";
import { isLoaded, isEmpty } from "react-redux-firebase";

import LoadingModal from "../components/LoadingModal";

const Page: React.FC = () => {
  const [state, setState] = useState({ isLoading: false });
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
        <title>surreal</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        {state.isLoading && <LoadingModal />}
        Profile
      </div>
    </>
  );
};

export default Page;
