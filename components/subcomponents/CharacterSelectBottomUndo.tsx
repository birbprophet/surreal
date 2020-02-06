import React from "react";
import { useFirestore } from "react-redux-firebase";
import { FiCornerDownLeft } from "react-icons/fi";

const CharacterSelectBottomUndo: React.FC<{ currentSession: any }> = ({
  currentSession
}) => {
  const firestore = useFirestore();
  const handleUndoOnClick = () => {
    firestore.update(`sessions/${currentSession.id}`, {
      characterConfirmed: false
    });
  };
  return currentSession.characterConfirmed &&
    !currentSession.adventureOption ? (
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
  ) : (
    <></>
  );
};

export default CharacterSelectBottomUndo;
