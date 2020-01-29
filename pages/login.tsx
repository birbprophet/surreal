import React, { useEffect, useState } from "react";
import Head from "next/head";
import Router from "next/router";

import { useSelector } from "react-redux";
import { useFirebase, isLoaded, isEmpty } from "react-redux-firebase";

import { FaGoogle, FaFacebookF } from "react-icons/fa";

import LoadingModal from "../components/LoadingModal";

const Page: React.FC = () => {
  const firebase = useFirebase();
  const [state, setState] = useState({ isLoading: false });
  const auth = useSelector(state => state.firebase.auth);
  const profile = useSelector(state => state.firebase.profile);

  useEffect(() => {
    if (isLoaded(auth) && !isEmpty(auth)) {
      if (isLoaded(profile) && !isEmpty(profile)) {
        Router.push("/home");
      } else if (isLoaded(profile) && isEmpty(profile)) {
        Router.push("/welcome");
      }
    }
    setState({ ...state, isLoading: !isLoaded(auth) || !isLoaded(profile) });
  }, [auth, profile]);

  const loginWithGoogle = () => {
    return firebase.login({ provider: "google", type: "redirect" });
  };

  const loginWithFacebook = () => {
    return firebase.login({ provider: "facebook", type: "redirect" });
  };

  return (
    <div>
      <Head>
        <title>Surreal - Login</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {state.isLoading && <LoadingModal />}
      <div className="h-screen w-screen bg-indigo-100 flex flex-col">
        <div className="flex-1" />
        <div className="mb-4 mx-10">
          <div className="text-4xl font-bold text-black leading-tight">
            Hello!
            <br />
            Let's get started
          </div>
        </div>
        <div className="mb-12 mx-10">
          <div className="text-xl">Please login to contiue</div>
        </div>
        <div className="mb-12 mx-10">
          <div className="mb-2">
            <button
              className="flex bg-blue-500 pl-8 pr-6 py-4 w-full rounded-full focus:outline-none"
              onClick={loginWithGoogle}
            >
              <div className="text-xl text-white w-full flex">
                <FaGoogle className="mt-1 mr-2" />
                <div className="flex-1">
                  Login with&nbsp;<span className="font-bold">Google</span>
                </div>
              </div>
            </button>
          </div>
          <div className="mb-2">
            <button
              className="flex bg-blue-800 pl-8 pr-6 py-4 w-full rounded-full focus:outline-none"
              onClick={loginWithFacebook}
            >
              <div className="text-xl text-white w-full flex">
                <FaFacebookF className="mt-1 mr-2" />
                <div className="flex-1">
                  Login with&nbsp;<span className="font-bold">Facebook</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
