import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Router from "next/router";

import { useSelector } from "react-redux";
import { isLoaded, isEmpty, useFirestoreConnect } from "react-redux-firebase";

import SVG from "react-inlinesvg";
import { FiArrowRight } from "react-icons/fi";

import LoadingModal from "../components/LoadingModal";

const Page: React.FC = () => {
  const [state, setState] = useState({
    isLoading: true,
    currentSession: null
  });
  const auth = useSelector(state => state.firebase.auth);
  useFirestoreConnect([
    {
      collection: "sessions",
      where: [
        ["user", "==", !state.isLoading && auth && auth.uid ? auth.uid : ""],
        ["status", "==", "in progress"]
      ]
    }
  ]);

  const sessions = useSelector(state => state.firestore.ordered.sessions);
  if (sessions !== undefined) {
    if (sessions.length > 0) {
      const currentSession = sessions[sessions.length - 1];
      if (currentSession !== state.currentSession) {
        setState({ ...state, currentSession });
      }
    }
  }

  useEffect(() => {
    if (isLoaded(auth) && isEmpty(auth)) {
      Router.push("/login");
    }
    setState({ ...state, isLoading: !isLoaded(auth) });
  }, [auth]);

  return (
    <>
      <Head>
        <title>surreal</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {state.isLoading && <LoadingModal />}
      <div className="flex h-full w-full p-8">
        <div className="h-full w-full flex bg-white shadow-md rounded-lg px-8 pt-12 pb-8">
          <div className="m-auto flex flex-col">
            <SVG src="./svgs/undraw_void_3ggu.svg" className="w-full h-40" />
            <div className="text-center text-3xl font-bold mt-8 text-indigo-900">
              {state.currentSession ? "Continue" : "Start Adventure"}
            </div>
            <div className="text-center text-xl">
              {state.currentSession
                ? "Resume your adventure"
                : "Click here to get started"}
            </div>
            <div className="mt-6">
              <Link href="/generate">
                <button className="flex bg-indigo-900 py-4 w-full rounded-full focus:outline-none px-6">
                  <div className="text-xl text-white w-full flex">
                    <FiArrowRight className="mt-1 text-indigo-900" size={24} />
                    <div className="flex-1 text-center">
                      {state.currentSession ? "Resume" : "Begin"}
                    </div>
                    <FiArrowRight className="mt-1" size={24} />
                  </div>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
