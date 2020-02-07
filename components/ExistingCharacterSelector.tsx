import React, { useEffect, useState } from "react";

import { useSelector } from "react-redux";
import { useFirestore } from "react-redux-firebase";
import { useFirestoreConnect } from "react-redux-firebase";

import algoliasearch from "algoliasearch/lite";

import TextTruncate from "react-text-truncate";
import { FiSearch, FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";

import CharacterSelectButton from "./subcomponents/CharacterSelectButton";
import CharacterSelectBottomUndo from "./subcomponents/CharacterSelectBottomUndo";

const ExistingCharacterSelector: React.FC<{ currentSession: any }> = ({
  currentSession
}) => {
  const firestore = useFirestore();
  const auth = useSelector(state => state.firebase.auth);
  const [state, setState] = useState({
    searchOpen: false,
    searchQuery: "",
    querySearched: false,
    searchResults: null,
    currentPage: 0
  });
  const currentCharacterId =
    state.searchResults && state.searchResults.length > state.currentPage
      ? state.searchResults[state.currentPage].objectID
      : "";
  useFirestoreConnect([
    {
      collection: "characters",
      doc: currentCharacterId
    }
  ]);
  const currentCharacter = useSelector(
    ({ firestore: { ordered } }) => ordered.characters && ordered.characters[0]
  );

  useEffect(() => {
    if (
      state.searchResults &&
      state.searchResults.length > 0 &&
      currentCharacter &&
      currentCharacter !== currentSession.character
    ) {
      firestore.update(`sessions/${currentSession.id}`, {
        character: currentCharacter
      });
    }
  }, [state, currentCharacter, currentSession]);

  useEffect(() => {
    if (state.searchResults && state.searchResults.length === 0) {
      if (currentSession.character) {
        firestore.update(`sessions/${currentSession.id}`, {
          character: null
        });
      }
    }
  }, [state]);

  const algoliaClient = algoliasearch(
    "DEUJZ7BCVJ",
    "18131dcda2fb175f7095a147496e2df1"
  );
  const charactersIndex = algoliaClient.initIndex("surreal_characters");

  useEffect(() => {
    if (!state.querySearched && auth?.uid) {
      charactersIndex
        .search(state.searchQuery, {
          headers: { "X-Algolia-UserToken": currentSession.user },
          filters: `isPublic:true OR createdBy:${auth.uid}`
        })
        .then(({ hits }) => {
          setState({
            ...state,
            searchResults: hits,
            querySearched: true
          });
        });
    }
  }, [state, auth]);

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

  const handleNextPageOnClick = () => {
    if (
      !currentSession?.characterConfirmed &&
      state.searchResults &&
      state.currentPage + 1 < state.searchResults.length
    ) {
      setState({ ...state, currentPage: state.currentPage + 1 });
    }
  };

  const handlePrevPageOnClick = () => {
    if (!currentSession?.characterConfirmed && state.currentPage > 0) {
      setState({ ...state, currentPage: state.currentPage - 1 });
    }
  };

  return (
    <>
      <div className="w-full bg-white p-6 shadow-lg rounded-lg">
        <div className="flex">
          {!state.searchOpen && (
            <>
              <div className="text-xl flex-1 text-gray-700">
                {!currentSession?.characterConfirmed
                  ? "Character Selection"
                  : "Character Selected"}
              </div>
              {!currentSession?.characterConfirmed ? (
                <FiSearch size={24} onClick={handleSearchOnClick} />
              ) : (
                <FiX size={24} className="text-gray-500" />
              )}
            </>
          )}
          {state.searchOpen && (
            <>
              {!currentSession?.characterConfirmed ? (
                <FiSearch
                  size={20}
                  className={
                    "mt-1 mr-2 " +
                    (state.searchQuery.length ? "" : "text-gray-500")
                  }
                />
              ) : (
                <></>
              )}
              <input
                className="text-xl flex-1 focus:outline-none"
                placeholder="Enter your query..."
                onChange={handleSearchInputOnChange}
                value={
                  !currentSession?.characterConfirmed
                    ? state.searchQuery
                    : "Character Selected"
                }
              />
              {!currentSession?.characterConfirmed ? (
                <FiX size={24} onClick={handleSearchCancelOnClick} />
              ) : (
                <FiX size={24} className="text-gray-500" />
              )}
            </>
          )}
        </div>
        <div className="h-64 pr-4 pt-2">
          <div className="flex text-4xl font-bold leading-tight h-24">
            <div className="m-auto text-center">
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
          <div className="flex mt-2 h-16">
            <div className="text-lg text-center m-auto">
              {currentSession.character ? (
                state.searchResults &&
                state.searchResults[state.currentPage] &&
                currentSession.character.displayName ===
                  state.searchResults[state.currentPage].displayName ? (
                  <TextTruncate
                    line={2}
                    element="span"
                    truncateText="…"
                    text={`${currentSession.character.displayName} is ${
                      ["a", "e", "i", "o", "u"].includes(
                        currentSession.character.ofType.slice(0, 1)
                      )
                        ? "an"
                        : "a"
                    } ${currentSession.character.ofType} from ${
                      currentSession.character.fromLocation
                    }`}
                  />
                ) : (
                  "Loading description..."
                )
              ) : state.searchResults ? (
                <span className="text-gray-500">
                  No characters found.
                  <br />
                  Try a different query...
                </span>
              ) : (
                "Loading description..."
              )}
            </div>
          </div>
          <div className="flex mt-6">
            <div className="flex">
              <button className="m-auto" onClick={handlePrevPageOnClick}>
                <FiChevronLeft
                  size={32}
                  className={
                    !currentSession?.characterConfirmed && state.currentPage > 0
                      ? "text-gray-700"
                      : "text-gray-200"
                  }
                />
              </button>
            </div>
            <div className="flex-1 px-6">
              {state.searchResults && state.searchResults.length ? (
                <CharacterSelectButton currentSession={currentSession} />
              ) : (
                <button
                  className={
                    "rounded-full w-full py-2 text-xl font-semibold text-gray-300 bg-gray-100"
                  }
                >
                  Select
                </button>
              )}
            </div>
            <div className="flex">
              <button className="m-auto">
                <FiChevronRight
                  size={32}
                  className={
                    !currentSession?.characterConfirmed &&
                    state.searchResults &&
                    state.currentPage + 1 < state.searchResults.length
                      ? "text-gray-700"
                      : "text-gray-200"
                  }
                  onClick={handleNextPageOnClick}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
      <CharacterSelectBottomUndo currentSession={currentSession} />
    </>
  );
};

export default ExistingCharacterSelector;
