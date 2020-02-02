import React, { useEffect, useState, useMemo } from "react";
import Head from "next/head";
import Router from "next/router";

import { useSelector } from "react-redux";
import {
  useFirebase,
  useFirestoreConnect,
  isLoaded,
  isEmpty
} from "react-redux-firebase";

import { motion } from "framer-motion";
import SVG from "react-inlinesvg";
import {
  FiArrowRight,
  FiAlertCircle,
  FiCheckCircle,
  FiPlus
} from "react-icons/fi";

import { useDropzone } from "react-dropzone";
import LoadingModal from "../components/LoadingModal";

const Page: React.FC = () => {
  const firebase = useFirebase();
  useFirestoreConnect([{ collection: "users" }]);
  const users = useSelector(state => state.firestore.ordered.users);
  const filesPath = "profilePictureUploads";

  const [state, setState] = useState({
    isLoading: false,
    pageNum: 0,
    inputUsername: "",
    errorMessage: "",
    uploadingMessage: "No profile picture",
    profilePictureUrl: null
  });
  const auth = useSelector(state => state.firebase.auth);
  const profile = useSelector(state => state.firebase.profile);

  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    accept: "image/*"
  });

  useEffect(() => {
    if (state.pageNum > 3) {
      Router.push("/create");
    }
  }, [state]);

  useEffect(() => {
    if (isLoaded(auth) && isEmpty(auth)) {
      Router.push("/login");
    }
    setState({ ...state, isLoading: !isLoaded(auth) || !isLoaded(profile) });
  }, [auth, profile]);

  useEffect(() => {
    if (state.inputUsername !== "" && state.inputUsername.charAt(0) !== "@") {
      setState({ ...state, inputUsername: "@" + state.inputUsername });
    }
  }, [state]);

  useEffect(() => {
    let errorMessage = getInvalidUsernameMessage(state.inputUsername);
    const cleanedUsername = state.inputUsername.replace("@", "");
    if (errorMessage === "" && cleanedUsername !== "") {
      if (users.map(user => user.username).includes(cleanedUsername)) {
        if (cleanedUsername !== profile.username) {
          errorMessage = `Username @${cleanedUsername} is already taken`;
        }
      }
    }
    if (errorMessage !== state.errorMessage) {
      setState({ ...state, errorMessage });
    }
  }, [state]);

  useEffect(() => {
    if (acceptedFiles.length > 0) {
      const profilePicture = acceptedFiles[0];

      firebase.uploadFile(filesPath, profilePicture, filesPath, {
        name: `${auth.uid}.${profilePicture.name.split(".").pop()}`
      });
      setState({ ...state, uploadingMessage: "Processing..." });
    }
  }, [acceptedFiles]);

  useEffect(() => {
    if (
      profile.profilePictureUrls &&
      profile.profilePictureUrls.small !== state.profilePictureUrl
    ) {
      setState({
        ...state,
        profilePictureUrl: profile.profilePictureUrls.small,
        uploadingMessage: "Picture uploaded!"
      });
    }
  }, [profile]);

  const variants = {
    hidden: { opacity: 0, x: "100%" },
    active: { opacity: 1, x: 0 },
    passed: { opacity: 0, x: "-100%" }
  };

  const handleContinueClick = () => {
    setState({ ...state, pageNum: state.pageNum + 1 });
  };

  const handleUsernameContinueClick = () => {
    const filteredProfile = Object.keys(profile)
      .filter(key => !["isEmpty", "isLoaded"].includes(key))
      .reduce((obj, key) => {
        obj[key] = profile[key];
        return obj;
      }, {});
    firebase.updateProfile({
      ...filteredProfile,
      username: state.inputUsername.slice(1),
      joined: new Date().toISOString(),
      description: "Write a short description",
      posts: [],
      followers: [],
      following: []
    });
    setState({ ...state, pageNum: state.pageNum + 1 });
  };

  const handleBackClick = () => {
    setState({ ...state, pageNum: state.pageNum - 1 });
  };

  const handleInputChange = event => {
    setState({ ...state, inputUsername: event.target.value });
  };

  return (
    <>
      <Head>
        <title>Surreal - Welcome</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {state.isLoading && <LoadingModal />}
      <motion.div
        className="absolute h-full w-full bg-indigo-100 flex flex-col"
        variants={variants}
        animate={state.pageNum === 0 ? "active" : "passed"}
      >
        <div className=" flex-1 flex flex-col bg-indigo-500 pb-12">
          <div className="m-auto">
            <SVG
              src="./svgs/undraw_celebration_0jvk.svg"
              className="w-full h-48"
            />
            <div className="mt-8 mx-10">
              <div className="text-5xl font-bold text-white text-center">
                Welcome!
              </div>
            </div>
            <div className="mt-2 mx-10">
              <div className="text-xl text-white text-center">
                We're almost ready to start our surreal adventures!
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 w-full px-10 pb-6 z-10">
          <button
            className="flex bg-indigo-900 py-4 w-full rounded-full focus:outline-none px-6"
            onClick={handleContinueClick}
          >
            <div className="text-xl text-white w-full flex">
              <FiArrowRight className="mt-1 text-indigo-900" size={24} />
              <div className="flex-1 text-center">Continue</div>
              <FiArrowRight className="mt-1" size={24} />
            </div>
          </button>
        </div>
      </motion.div>
      <motion.div
        className="absolute h-full w-full bg-white flex flex-col"
        variants={variants}
        animate={
          state.pageNum === 1
            ? "active"
            : state.pageNum === 2
            ? "passed"
            : "hidden"
        }
      >
        <div className="flex-1" />
        <SVG src="./svgs/undraw_fall_thyk.svg" className="w-full h-48" />
        <div className="flex flex-row bg-indigo-500 px-10 pt-8">
          <div className="text-2xl text-white pr-4">1.</div>
          <div className="flex-1 flex flex-col">
            <div className="mb-4">
              <div className="text-2xl text-white">
                Okay firstly,
                <br />
                what shall we call you?
              </div>
            </div>
            <div className="mb-2">
              <div className="text-lg text-indigo-200">Enter your username</div>
              <div className="flex items-center border-b border-b-2 border-white py-2">
                <input
                  className="appearance-none bg-transparent border-none w-full py-1 text-white text-xl font-semibold focus:outline-none"
                  type="text"
                  aria-label="username"
                  value={state.inputUsername}
                  onChange={handleInputChange}
                  maxLength={13}
                />
                {state.errorMessage && (
                  <FiAlertCircle size={24} className="text-indigo-200 mx-2" />
                )}
                {!state.errorMessage && state.inputUsername && (
                  <FiCheckCircle size={24} className="text-indigo-200 mx-2" />
                )}
              </div>
              {(state.errorMessage || !state.inputUsername) && (
                <div className="mt-2 h-12 text-red-200">
                  {state.errorMessage}
                </div>
              )}
              {!state.errorMessage &&
                state.inputUsername &&
                (state.inputUsername.slice(1) === profile.username ? (
                  <div className="mt-2 h-6 text-green-200">
                    Your current username is {state.inputUsername}
                  </div>
                ) : (
                  <div className="mt-2 h-6 text-green-200">
                    {state.inputUsername} is available!
                  </div>
                ))}
              <div
                className={
                  "h-12 " +
                  (state.errorMessage || !state.inputUsername
                    ? "mb-6"
                    : "mb-12")
                }
              ></div>
              {!state.errorMessage && state.inputUsername && (
                <div className="absolute right-0 bottom-0 pb-6 pr-10">
                  <button
                    className="flex bg-indigo-900 py-2 w-full rounded-full focus:outline-none px-6"
                    onClick={handleUsernameContinueClick}
                  >
                    <div className="text-xl text-white w-full flex">
                      <div className="flex-1 text-center">Next</div>
                      <FiArrowRight className="mt-1 ml-4" />
                    </div>
                  </button>
                </div>
              )}

              <div className="absolute left-0 bottom-0 pb-6 pl-4">
                <button
                  className="flex bg-transparent py-2 w-full rounded-full focus:outline-none px-6"
                  onClick={handleBackClick}
                >
                  <div className="text-xl text-indigo-300 w-full flex">
                    <div className="flex-1 text-center">Back</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      <motion.div
        className="absolute h-screen w-full flex flex-col"
        variants={variants}
        animate={
          state.pageNum === 2
            ? "active"
            : state.pageNum === 3
            ? "passed"
            : "hidden"
        }
      >
        <div className="flex-1" />
        <SVG
          src="./svgs/undraw_taking_selfie_lbo7.svg"
          className="w-full h-48"
        />
        <div className="flex flex-row bg-indigo-500 px-10 pt-8">
          <div className="text-2xl text-white pr-4">2.</div>
          <div className="flex-1 flex flex-col">
            <div className="mb-4">
              <div className="text-2xl text-white">
                Would you like to
                <br />
                add a profile picture?
              </div>
            </div>
            <div className="mb-2 h-48">
              <div className="mt-2 flex flex-row">
                {state.profilePictureUrl ? (
                  <div
                    {...getRootProps()}
                    className="bg-indigo-400 rounded-full h-20 w-20 flex"
                  >
                    <input {...getInputProps()} />
                    <img
                      className="m-auto rounded-full h-16 w-16"
                      src={state.profilePictureUrl}
                      alt="profile picture"
                    />
                  </div>
                ) : (
                  <div
                    {...getRootProps()}
                    className="bg-indigo-400 rounded-full h-20 w-20 flex focus:outline-none"
                  >
                    <input {...getInputProps()} />
                    <FiPlus className="m-auto text-indigo-200" size={32} />
                  </div>
                )}
                <div className="mt-4 ml-4 flex flex-col">
                  <div className="text-white font-semibold text-xl">
                    @{profile.username}
                  </div>
                  <div className="text-indigo-200">
                    {state.uploadingMessage}
                  </div>
                </div>
              </div>

              <div className="absolute left-0 bottom-0 pb-6 pl-4">
                <button
                  className="flex bg-transparent py-2 w-full rounded-full focus:outline-none px-6"
                  onClick={handleBackClick}
                >
                  <div className="text-xl text-indigo-300 w-full flex">
                    <div className="flex-1 text-center">Back</div>
                  </div>
                </button>
              </div>

              <div className="absolute right-0 bottom-0 pb-6 pr-10">
                <button
                  className="flex bg-indigo-900 py-2 w-full rounded-full focus:outline-none px-6"
                  onClick={handleContinueClick}
                >
                  <div className="text-xl text-white w-full flex">
                    <div className="flex-1 text-center">
                      {profile.profilePictureUrls ? "Next" : "Skip"}
                    </div>
                    <FiArrowRight className="mt-1 ml-4" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      <motion.div
        className="absolute h-screen w-full flex flex-col"
        variants={variants}
        animate={
          state.pageNum === 3
            ? "active"
            : state.pageNum === 4
            ? "passed"
            : "hidden"
        }
      >
        <div className=" flex-1 flex flex-col bg-indigo-500 pb-12">
          <div className="m-auto">
            <SVG
              src="./svgs/undraw_confirmation_2uy0.svg"
              className="w-full h-48"
            />
            <div className="mt-8 mx-10">
              <div className="text-5xl font-bold text-white text-center">
                Complete!
              </div>
            </div>
            <div className="mt-2 mx-10">
              <div className="text-xl text-white text-center">
                Now, it's time to embark on our adventures into the surreal...
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 w-full px-10 pb-6 z-10">
          <button
            className="flex bg-indigo-900 py-4 w-full rounded-full focus:outline-none px-6"
            onClick={handleContinueClick}
          >
            <div className="text-xl text-white w-full flex">
              <FiArrowRight className="mt-1 text-indigo-900" size={24} />
              <div className="flex-1 text-center">Go to App</div>
              <FiArrowRight className="mt-1" size={24} />
            </div>
          </button>
        </div>
      </motion.div>
    </>
  );
};

const getInvalidUsernameMessage = (rawInputUsername: string): string => {
  if (rawInputUsername.length === 1) {
    return "Please enter a username";
  }
  const inputUsername = rawInputUsername.slice(1);

  if (
    !inputUsername.match(/^[a-z0-9_][a-z0-9._]+[a-z0-9_]$/) ||
    inputUsername.match(/\.\./)
  ) {
    if (inputUsername === "") {
      return "";
    } else if (inputUsername.match(/^\./) || inputUsername.match(/\.$/)) {
      return "Username cannot start or end with .";
    } else if (inputUsername.match(/\.\./)) {
      return "Username cannot contain more than 1 . in a row";
    } else if (inputUsername.length < 3) {
      return "Username must be at least 3 characters long";
    } else {
      return "Username can only contain letters, numbers, ., or _";
    }
  } else {
    return "";
  }
};

export default Page;
