import React, { useEffect } from "react";

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

  return (
    <>
      <div className="w-full bg-white p-6 shadow-lg rounded-lg"></div>
    </>
  );
};

export default AdventureOptionPicker;
