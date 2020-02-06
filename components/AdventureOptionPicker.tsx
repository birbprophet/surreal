import React, { useEffect, useState } from "react";

import { useSelector } from "react-redux";
import { useFirestore } from "react-redux-firebase";
import { useFirestoreConnect } from "react-redux-firebase";

import TextTruncate from "react-text-truncate";

import { FiRefreshCw } from "react-icons/fi";

import CharacterSelectButton from "./subcomponents/CharacterSelectButton";
import CharacterSelectBottomUndo from "./subcomponents/CharacterSelectBottomUndo";

const AdventureOptionPicker: React.FC<{ currentSession: any }> = ({
  currentSession
}) => {
  const firestore = useFirestore();

  const handleOptionOnClick = selectedOption => {
    if (currentSession && !currentSession.adventureOption) {
      firestore.update(`sessions/${currentSession.id}`, {
        adventureOption: selectedOption
      });
    }
  };

  return (
    <>
      <div className="w-full bg-indigo-500 p-6 shadow-lg rounded-lg">
        <div className="flex flex-col">
          <button
            className={
              "p-2 text-xl rounded-full font-semibold mb-3 " +
              (currentSession.adventureOption === "new"
                ? "bg-white text-indigo-500 border border-white"
                : "bg-indigo-500 text-white border border-white")
            }
            onClick={() => handleOptionOnClick("new")}
          >
            Start a new adventure
          </button>
          <button
            className={
              "p-2 text-xl rounded-full font-semibold " +
              (currentSession.adventureOption === "join"
                ? "bg-white text-indigo-500 border border-white"
                : "bg-indigo-500 text-white border border-white")
            }
            onClick={() => handleOptionOnClick("join")}
          >
            Join a friend's adventure
          </button>
        </div>
      </div>
    </>
  );
};

export default AdventureOptionPicker;
