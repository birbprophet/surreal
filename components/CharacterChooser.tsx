import React from "react";
import { useFirestore } from "react-redux-firebase";

import { FiCornerDownLeft } from "react-icons/fi";

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

  const handleUndoOnClick = () => {
    firestore.update(`sessions/${currentSession.id}`, {
      character: null,
      characterSelectOption: null
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
                  className="bg-indigo-500 text-white border border-white p-2 text-xl rounded-full font-semibold mb-3"
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
            {Object.keys(characterOptions).map(key => {
              if (key === currentSession.characterSelectOption) {
                return (
                  <button
                    className="bg-white text-indigo-500 border border-white p-2 text-xl rounded-full font-semibold mb-3"
                    key={key}
                  >
                    {characterOptions[key]}
                  </button>
                );
              } else {
                return (
                  <button
                    className="bg-indigo-500 text-white border border-white p-2 text-xl rounded-full font-semibold mb-3"
                    key={key}
                  >
                    {characterOptions[key]}
                  </button>
                );
              }
            })}
          </div>
        )}
      </div>
      {currentSession.characterSelectOption &&
        !currentSession.characterConfirmed && (
          <div className="w-full flex flex-row px-2 pt-1">
            <div className="flex-1" />
            <button
              className="flex py-1 px-2 rounded-full"
              onClick={handleUndoOnClick}
            >
              <FiCornerDownLeft className="mt-1 mr-1" />
              <div>Undo</div>
            </button>
          </div>
        )}
    </>
  );
};

export default CharacterChooser;
