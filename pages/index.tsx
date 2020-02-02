import React, { useEffect } from "react";
import Head from "next/head";
import Router from "next/router";

import { useSelector } from "react-redux";
import { isLoaded, isEmpty } from "react-redux-firebase";

import LoadingModal from "../components/LoadingModal";

const Page: React.FC = () => {
  const auth = useSelector(state => state.firebase.auth);

  useEffect(() => {
    if (isLoaded(auth) && !isEmpty(auth)) {
      Router.push("/home");
    } else if (isLoaded(auth) && isEmpty(auth)) {
      Router.push("/login");
    }
  }, [auth]);

  return (
    <>
      <Head>
        <title>Surreal</title>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
        />
      </Head>
      {!isLoaded(auth) && <LoadingModal />}
    </>
  );
};

export default Page;
