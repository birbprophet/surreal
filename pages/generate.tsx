import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Router from "next/router";

import { useSelector } from "react-redux";
import { isLoaded, isEmpty, useFirestore } from "react-redux-firebase";
import { useFirestoreConnect } from "react-redux-firebase";

import algoliasearch from "algoliasearch/lite";

import SVG from "react-inlinesvg";
import ScrollableFeed from "react-scrollable-feed";
import {
  FiArrowLeft,
  FiCornerDownLeft,
  FiRotateCw,
  FiRefreshCw,
  FiSearch,
  FiX
} from "react-icons/fi";

import LoadingModal from "../components/LoadingModal";

const Page: React.FC = () => {
  const firestore = useFirestore();
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
      ],
      limit: 1
    }
  ]);

  const sessions = useSelector(state => state.firestore.ordered.sessions);
  if (sessions !== undefined) {
    if (sessions.length === 1) {
      const currentSession = sessions[0];
      if (currentSession !== state.currentSession) {
        setState({ ...state, currentSession });
      }
    } else {
      const currentSession = {
        user: auth.uid,
        status: "in progress",
        started: new Date().toISOString()
      };
      firestore.add("sessions", currentSession);
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
      {(state.isLoading || !state.currentSession) && <LoadingModal />}
      <div className="h-full w-full bg-indigo-100 flex flex-col">
        <BackTopBar currentSession={state.currentSession} />
        <ScrollableFeed>
          <div className="h-full w-full flex flex-col px-6 pt-12">
            {state.currentSession && (
              <CharacterChooser currentSession={state.currentSession} />
            )}
          </div>
        </ScrollableFeed>
      </div>
    </>
  );
};

const RandomCharacterSelector: React.FC<{ currentSession: any }> = ({
  currentSession
}) => {
  const firestore = useFirestore();
  useFirestoreConnect([
    {
      collection: "characters",
      storeAs: "randomPoolCharacters",
      where: ["inRandomPool", "==", true]
    }
  ]);

  const randomPoolCharacters = useSelector(
    state => state.firestore.ordered.randomPoolCharacters
  );

  if (currentSession && !currentSession.character) {
    if (randomPoolCharacters && randomPoolCharacters.length > 0) {
      const randomCharacter =
        randomPoolCharacters[
          Math.floor(Math.random() * randomPoolCharacters.length)
        ];

      firestore.update(`characters/${randomCharacter.id}`, {
        usedCount: randomCharacter.usedCount + 1
      });

      firestore.update(`sessions/${currentSession.id}`, {
        character: randomCharacter
      });
    }
  }

  return (
    <div className="w-full bg-white p-6 mt-8 shadow-lg rounded-lg">
      <div className="text-xl">Your random character is...</div>
      <div className="text-4xl font-bold pr-4 pt-2 leading-tight">
        {currentSession.character
          ? currentSession.character.name
          : "Loading..."}
      </div>
    </div>
  );
};

const ExistingCharacterSelector: React.FC<{ currentSession: any }> = ({
  currentSession
}) => {
  const [state, setState] = useState({
    searchOpen: false,
    searchQuery: "",
    querySearched: false,
    searchResults: null,
    currentPage: 0
  });
  const algoliaClient = algoliasearch(
    "DEUJZ7BCVJ",
    "18131dcda2fb175f7095a147496e2df1"
  );
  const charactersIndex = algoliaClient.initIndex("surreal_characters");

  useEffect(() => {
    if (!state.querySearched) {
      charactersIndex
        .search(state.searchQuery, {
          headers: { "X-Algolia-UserToken": currentSession.user }
        })
        .then(({ hits }) => {
          console.log(hits);
          setState({
            ...state,
            searchResults: hits,
            querySearched: true
          });
        });
    }
  }, [state]);

  const handleSearchOnClick = () => {
    setState({ ...state, searchOpen: true });
  };

  const handleSearchCancelOnClick = () => {
    setState({
      ...state,
      searchQuery: "",
      querySearched: false,
      searchOpen: false
    });
  };

  const handleSearchInputOnChange = event => {
    setState({
      ...state,
      searchQuery: event.target.value
        .replace(/[^a-z0-9 ]+/gi, " ")
        .replace(/[ ]+/, " "),
      querySearched: false
    });
  };

  return (
    <div className="w-full bg-white p-6 mt-8 shadow-lg rounded-lg">
      <div className="flex">
        {!state.searchOpen && (
          <>
            <div className="text-xl flex-1">Character Selection</div>
            <FiSearch size={24} onClick={handleSearchOnClick} />
          </>
        )}
        {state.searchOpen && (
          <>
            <input
              className="text-xl flex-1 focus:outline-none"
              placeholder="Enter your query..."
              onChange={handleSearchInputOnChange}
              value={state.searchQuery}
            />
            <FiX size={24} onClick={handleSearchCancelOnClick} />
          </>
        )}
      </div>

      <div className="text-4xl font-bold pr-4 pt-2 leading-tight h-24">
        {state.searchResults ? (
          state.searchResults.length > 0 ? (
            <div
              dangerouslySetInnerHTML={{
                __html: state.searchResults[
                  state.currentPage
                ]._highlightResult.name.value
                  .replace(/<em>/g, '<span class="bg-indigo-100">')
                  .replace(/<\/em>/g, "</span>")
              }}
            />
          ) : (
            "No Results"
          )
        ) : (
          "Loading..."
        )}
      </div>
    </div>
  );
};

const CharacterChooser: React.FC<{ currentSession: any }> = ({
  currentSession
}) => {
  const firestore = useFirestore();
  const characterOptions = {
    random: "Random Character",
    existing: "Existing Character",
    new: "Create New Character"
  };

  const handleSelectionOnClick = option => {
    firestore.update(`sessions/${currentSession.id}`, {
      characterSelectOption: option
    });
  };

  const handleRefreshOnClick = () => {
    firestore.update(`sessions/${currentSession.id}`, {
      character: null
    });
  };

  return (
    <>
      <div className="w-full bg-indigo-500 text-white p-6 rounded-lg shadow-lg">
        <div className="text-3xl tracking-wider font-bold">
          CHOOSE YOUR
          <br />
          CHARACTER
        </div>
        <div className="mt-4 text-lg">
          This character will be the protagonist in your adventure
        </div>
        {!currentSession.characterSelectOption && (
          <div className="flex flex-col mt-8">
            {Object.keys(characterOptions).map(key => {
              return (
                <button
                  className="bg-white text-indigo-600 p-2 text-xl rounded-full font-semibold mb-3"
                  onClick={() => handleSelectionOnClick(key)}
                  key={key}
                >
                  {characterOptions[key]}
                </button>
              );
            })}
          </div>
        )}
        {currentSession.characterSelectOption && (
          <div className="flex flex-col mt-8">
            <button className="bg-green-200 text-green-900 p-2 text-xl rounded-full font-bold mb-3">
              {characterOptions[currentSession.characterSelectOption]}
            </button>
          </div>
        )}
      </div>
      {currentSession.characterSelectOption === "random" && (
        <RandomCharacterSelector currentSession={currentSession} />
      )}
      {currentSession.characterSelectOption === "existing" && (
        <ExistingCharacterSelector currentSession={currentSession} />
      )}
      {currentSession.characterSelectOption &&
        !currentSession.characterConfirmed && (
          <div className="w-full flex flex-row px-2 pt-1">
            {currentSession.characterSelectOption === "random" && (
              <button
                className="flex py-1 px-2 rounded-full"
                onClick={handleRefreshOnClick}
              >
                <FiRefreshCw className="mt-1 mr-2" />
                <div>Refresh</div>
              </button>
            )}
            <div className="flex-1" />
            <button
              className="flex py-1 px-2 rounded-full"
              onClick={() => handleSelectionOnClick(null)}
            >
              <FiCornerDownLeft className="mt-1 mr-1" />
              <div>Undo</div>
            </button>
          </div>
        )}
    </>
  );
};

const BackTopBar: React.FC<{ currentSession: any }> = ({ currentSession }) => {
  const firestore = useFirestore();

  const handleRestartOnClick = option => {
    if (currentSession && currentSession.id) {
      firestore.update(`sessions/${currentSession.id}`, {
        ended: new Date().toISOString(),
        status: "cancelled"
      });
    }
  };

  return (
    <div className="py-4 px-6 bg-white rounded-b-lg shadow-md flex">
      <Link href="/create">
        <button className="flex">
          <FiArrowLeft size={20} className="text-gray-500" />
          <div
            className="text-lg ml-2 font-semibold text-gray-500"
            style={{ lineHeight: "20px" }}
          >
            Back
          </div>
        </button>
      </Link>
      <div className="flex-1" />
      <button className="flex" onClick={handleRestartOnClick}>
        <div
          className="text-lg mr-2 font-semibold text-gray-500"
          style={{ lineHeight: "20px" }}
        >
          Restart Adventure
        </div>
        <FiRotateCw size={20} className="text-gray-500" />
      </button>
    </div>
  );
};

export default Page;
