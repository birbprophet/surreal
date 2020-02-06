import React, { useEffect } from "react";

import { useSelector } from "react-redux";
import { useFirestore } from "react-redux-firebase";
import { useFirestoreConnect } from "react-redux-firebase";

import TextTruncate from "react-text-truncate";

import { FiRefreshCw } from "react-icons/fi";

import CharacterSelectButton from "./subcomponents/CharacterSelectButton";
import CharacterSelectBottomUndo from "./subcomponents/CharacterSelectBottomUndo";

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

  useEffect(() => {
    if (currentSession && !currentSession.character) {
      if (randomPoolCharacters && randomPoolCharacters.length > 0) {
        const randomCharacter =
          randomPoolCharacters[
            Math.floor(Math.random() * randomPoolCharacters.length)
          ];

        firestore.update(`sessions/${currentSession.id}`, {
          character: randomCharacter
        });
      }
    }
  }, [currentSession, randomPoolCharacters]);

  const handleRefreshOnClick = () => {
    firestore.update(`sessions/${currentSession.id}`, {
      character: null
    });
  };

  return (
    <>
      <div className="w-full bg-white p-6 mt-8 shadow-lg rounded-lg">
        <div className="text-xl text-center">Your random character is...</div>
        <div className="text-4xl font-bold pr-4 pt-2 leading-tight h-24 flex">
          <div className="m-auto text-center">
            {currentSession.character
              ? currentSession.character.name
              : "Loading..."}
          </div>
        </div>
        <div className="flex mt-2 h-16">
          <div className="text-lg text-center m-auto">
            {currentSession.character ? (
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
            )}
          </div>
        </div>
        <div className="flex h-12 mt-6">
          <div className="flex h-12 w-12 ml-6">
            <button
              className="bg-white border border-indigo-500 rounded-full py-2 text-xl font-semibold text-white h-10 w-10 flex m-auto"
              onClick={handleRefreshOnClick}
            >
              <FiRefreshCw className="m-auto text-indigo-500" />
            </button>
          </div>

          <div className="flex-1 px-6">
            <CharacterSelectButton currentSession={currentSession} />
          </div>
        </div>
      </div>
      <CharacterSelectBottomUndo currentSession={currentSession} />
    </>
  );
};

export default RandomCharacterSelector;
