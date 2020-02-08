import React, { useEffect, useState } from "react";
import Head from "next/head";
import Router from "next/router";

import { useSelector } from "react-redux";
import {
  useFirebase,
  isLoaded,
  isEmpty,
  useFirestore,
  useFirestoreConnect
} from "react-redux-firebase";

import { FiMenu } from "react-icons/fi";
import TextTruncate from "react-text-truncate";

import LoadingModal from "../components/LoadingModal";
import Link from "next/link";

const Page: React.FC = () => {
  const firebase = useFirebase();

  const [state, setState] = useState({
    isLoading: true,
    currentView: "adventures"
  });
  const auth = useSelector(state => state.firebase.auth);
  const profile = useSelector(state => state.firebase.profile);

  useFirestoreConnect([
    {
      collection: "characters",
      storeAs: "userCharacters",
      where: [
        [
          "createdBy",
          "==",
          !state.isLoading && auth && auth.uid ? auth.uid : "NO_UID"
        ]
      ]
    }
  ]);

  const userCharacters = useSelector(
    state => state.firestore.ordered.userCharacters
  );

  useFirestoreConnect([
    {
      collection: "adventures",
      storeAs: "userAdventures",
      where: [
        [
          "createdBy",
          "==",
          !state.isLoading && auth && auth.uid ? auth.uid : "NO_UID"
        ],
        ["status", "==", "completed"]
      ]
    }
  ]);

  const userAdventures = useSelector(
    state => state.firestore.ordered.userAdventures
  );

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

  const handleViewChange = view => {
    setState({ ...state, currentView: view });
  };

  return (
    <>
      <Head>
        <title>Surreal - Profile</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {state.isLoading && <LoadingModal />}
      <div className="flex flex-col bg-white rounded-b-lg px-6 pt-6 shadow-lg">
        <TopBar handleLogout={handleLogout} />
        <ProfileSection
          profile={profile}
          handleProfileDescriptionChange={handleProfileDescriptionChange}
          userCharacters={userCharacters}
          userAdventures={userAdventures}
          handleViewChange={handleViewChange}
          state={state}
        />
      </div>
      <div className="flex flex-col p-6">
        {state.currentView === "adventures" &&
          userAdventures &&
          userAdventures.length > 0 &&
          userAdventures.map(adventure => (
            <div key={adventure.id} className="mb-4">
              <AdventureCard adventure={adventure} />
            </div>
          ))}
        {state.currentView === "adventures" &&
          userAdventures &&
          !userAdventures.length && (
            <div className="text-center w-full mt-2 flex flex-col">
              <i>No adventures yet...</i>
              <Link href="/generate">
                <button className="text-xl p-2 mx-4 mt-4 bg-white font-semibold rounded-full shadow-md text-indigo-700">
                  Start your first adventure
                </button>
              </Link>
            </div>
          )}
        {state.currentView === "characters" &&
          userCharacters &&
          userCharacters.length &&
          userCharacters.map(character => (
            <div key={character.id} className="mb-4">
              <CharacterCard character={character} />
            </div>
          ))}
        {state.currentView === "characters" &&
          userCharacters &&
          !(userCharacters.length > 0) && (
            <div className="text-center w-full mt-2 flex flex-col">
              <i>No characters yet...</i>
              <Link href="/generate">
                <button className="text-xl p-2 mx-4 mt-4 bg-white font-semibold rounded-full shadow-md text-indigo-700">
                  Start your first adventure
                </button>
              </Link>
            </div>
          )}
      </div>
    </>
  );
};

const AdventureCard = ({ adventure }) => {
  const firestore = useFirestore();
  const handleOnDeleteClick = () => {
    firestore.delete(`characters/${adventure.id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md w-full p-6">
      <div className="flex">
        <div className="text-xl font-semibold">
          {adventure.sessions[0].character.name}
        </div>
        <div className="flex-1" />
        <div
          className="w-16 rounded-sm border border-red-500 text-center cursor-pointer text-red-500"
          onClick={handleOnDeleteClick}
        >
          Delete
        </div>
      </div>
    </div>
  );
};

const CharacterCard = ({ character }) => {
  const firestore = useFirestore();
  const handleOnPublicClick = () => {
    if (!character?.isPublic) {
      firestore.update(`characters/${character.id}`, {
        isPublic: true
      });
    }
  };

  const handleOnPrivateClick = () => {
    if (character?.isPublic) {
      firestore.update(`characters/${character.id}`, {
        isPublic: false
      });
    }
  };

  const handleOnDeleteClick = () => {
    firestore.delete(`characters/${character.id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md w-full p-6">
      <div className="text-xl font-semibold">{character.name}</div>
      <div className="h-16 mt-2">
        <TextTruncate
          line={2}
          element="span"
          truncateText="…"
          text={`${character.displayName} is ${
            ["a", "e", "i", "o", "u"].includes(character.ofType.slice(0, 1))
              ? "an"
              : "a"
          } ${character.ofType} from ${character.fromLocation}`}
        />
      </div>
      <div className="flex">
        <div
          className={
            "w-16 rounded-l-sm text-center border border-indigo-500 cursor-pointer " +
            (character.isPublic
              ? "bg-indigo-500 text-white"
              : "bg-white text-indigo-500")
          }
          onClick={handleOnPublicClick}
        >
          Public
        </div>
        <div
          className={
            "w-16 rounded-r-sm border border-indigo-500 text-center cursor-pointer " +
            (!character.isPublic
              ? "bg-indigo-500 text-white"
              : "bg-white text-indigo-500")
          }
          onClick={handleOnPrivateClick}
        >
          Private
        </div>
        <div className="flex-1" />
        <div
          className="w-16 rounded-sm border border-red-500 text-center cursor-pointer text-red-500"
          onClick={handleOnDeleteClick}
        >
          Delete
        </div>
      </div>
    </div>
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

const ProfileSection = ({
  profile,
  handleProfileDescriptionChange,
  userCharacters,
  userAdventures,
  handleViewChange,
  state
}) => {
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
      <div className="flex w-full my-4">
        <div
          className={
            "flex-1 text-center py-2 mx-4 cursor-pointer " +
            (state.currentView === "adventures"
              ? "text-indigo-700 border border-indigo-700 rounded"
              : "text-gray-400")
          }
          onClick={() => handleViewChange("adventures")}
        >
          <div className="">Adventures</div>
          <div className="text-xl font-bold text-black">
            {userAdventures ? userAdventures.length : 0}
          </div>
        </div>
        {/* <div className="flex-1 text-center">
          <div className="text-gray-400">Friends</div>
          <div className="text-xl font-bold">
            {profile.friends ? profile.friends.length : 0}
          </div>
        </div> */}
        <div
          className={
            "flex-1 text-center py-2 mx-4 cursor-pointer " +
            (state.currentView === "characters"
              ? "text-indigo-700 border border-indigo-700 rounded"
              : "text-gray-400")
          }
          onClick={() => handleViewChange("characters")}
        >
          <div className="">Characters</div>
          <div className="text-xl font-bold text-black">
            {userCharacters ? userCharacters.length : 0}
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
