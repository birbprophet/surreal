import React from "react";
import Link from "next/link";

import { useFirestore } from "react-redux-firebase";

import { FiArrowLeft, FiRotateCw } from "react-icons/fi";

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

export default BackTopBar;
