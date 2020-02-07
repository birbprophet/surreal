import React from "react";

import { useFirestore } from "react-redux-firebase";

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
          {/* <button
            className={
              "p-2 text-xl rounded-full font-semibold " +
              (currentSession.adventureOption === "join"
                ? "bg-white text-indigo-500 border border-white"
                : "bg-indigo-500 text-white border border-white")
            }
            onClick={() => handleOptionOnClick("join")}
          >
            Join a friend's adventure
          </button> */}
          <button
            className={
              "p-2 text-xl rounded-full font-semibold " +
              (currentSession.adventureOption === "join"
                ? "bg-white text-indigo-500 border border-white"
                : "bg-indigo-500 text-indigo-300 border border-indigo-300")
            }
          >
            Multiplayer unavailable
          </button>
        </div>
      </div>
    </>
  );
};

export default AdventureOptionPicker;
