import React, { useEffect, useState } from "react";
import Head from "next/head";
import Router from "next/router";

import { useSelector } from "react-redux";
import { useFirebase, isLoaded, isEmpty } from "react-redux-firebase";

import { FiMenu } from "react-icons/fi";

import LoadingModal from "../components/LoadingModal";

const Page: React.FC = () => {
  const firebase = useFirebase();
  const [state, setState] = useState({ isLoading: true });
  const auth = useSelector(state => state.firebase.auth);

  const profile = useSelector(state => state.firebase.profile);

  useEffect(() => {
    if (isLoaded(auth) && isEmpty(auth)) {
      Router.push("/login");
    }
    setState({ ...state, isLoading: !isLoaded(auth) });
  }, [auth]);

  const handleLogout = () => firebase.logout();

  const handleProfileDescriptionChange = event => {
    const filteredProfile = Object.keys(profile)
      .filter(key => !["isEmpty", "isLoaded"].includes(key))
      .reduce((obj, key) => {
        obj[key] = profile[key];
        return obj;
      }, {});
    firebase.updateProfile({
      ...filteredProfile,
      description: event.target.value
    });
  };

  return (
    <>
      <Head>
        <title>Surreal - Profile</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {state.isLoading && <LoadingModal />}
      <div className="scrolling-auto">
        <div className="flex flex-col bg-white rounded-b-lg px-6 pt-6 shadow-lg">
          <TopBar handleLogout={handleLogout} />
          <ProfileSection
            profile={profile}
            handleProfileDescriptionChange={handleProfileDescriptionChange}
          />
        </div>
        {profile.posts && !profile.posts.length && (
          <div className="flex">
            <div className="m-auto">No posts yet</div>
          </div>
        )}
      </div>
    </>
  );
};

const TopBar = ({ handleLogout }) => {
  const [state, setState] = useState({
    menuOpen: false
  });

  const handleMenuOnClick = () => {
    setState({ ...state, menuOpen: !state.menuOpen });
  };
  return (
    <>
      <div className="flex flex-row">
        <div className="flex-1">
          <div className="text-2xl font-bold tracking-wide">Profile</div>
        </div>
        <div className="mt-1">
          <FiMenu size={24} onClick={handleMenuOnClick} />
        </div>
      </div>
      {state.menuOpen ? (
        <div
          className="absolute top-0 right-0 z-10 shadow-md mt-16 mr-6 px-4 py-2 text-lg"
          onClick={handleLogout}
        >
          Logout
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

const ProfileSection = ({ profile, handleProfileDescriptionChange }) => {
  return (
    <>
      <div className="flex w-full">
        <div className="mt-8 mx-auto flex flex-col">
          <div className="mx-auto bg-indigo-100 rounded-full h-24 w-24 flex">
            {profile.profilePictureUrls ? (
              <img
                className="m-auto rounded-full h-20 w-20"
                src={profile.profilePictureUrls.small}
                alt="profile picture"
              />
            ) : (
              <></>
            )}
          </div>
          <div className="mt-4">
            <div className="text-xl text-center font-semibold">
              {profile.username ? `@${profile.username}` : ""}
            </div>
          </div>
          <div className="mt-2">
            <input
              className="appearance-none bg-transparent border-none w-full py-1 text-center text-gray-400 focus:outline-none text-lg"
              type="text"
              aria-label="username"
              value={
                profile.description !== undefined
                  ? profile.description
                  : "Loading description..."
              }
              onChange={handleProfileDescriptionChange}
              maxLength={32}
            />
          </div>
        </div>
      </div>
      <div className="flex w-full mt-8 mb-8">
        <div className="flex-1 text-center">
          <div className="text-gray-400">Adventures</div>
          <div className="text-xl font-bold">
            {profile.adventures ? profile.adventures.length : 0}
          </div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-gray-400">Friends</div>
          <div className="text-xl font-bold">
            {profile.friends ? profile.friends.length : 0}
          </div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-gray-400">Characters</div>
          <div className="text-xl font-bold">
            {profile.characters ? profile.characters.length : 0}
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
