import React from "react";
import { useFirestore } from "react-redux-firebase";

const CharacterSelectButton: React.FC<{ currentSession: any }> = ({
  currentSession
}) => {
  const firestore = useFirestore();
  const handleSelectOnClick = () => {
    firestore.update(`sessions/${currentSession.id}`, {
      characterConfirmed: true
    });
  };
  return (
    <button
      className={
        "rounded-full w-full py-2 text-xl font-semibold " +
        (currentSession.characterConfirmed
          ? "bg-green-500 text-white"
          : "bg-indigo-500 text-white")
      }
      onClick={handleSelectOnClick}
    >
      {currentSession.characterConfirmed ? "Selected" : "Select"}
    </button>
  );
};

export default CharacterSelectButton;
