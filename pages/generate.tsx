import React, { useEffect, useState, useRef } from "react";
import Head from "next/head";
import Router from "next/router";

import { useSelector } from "react-redux";
import { isLoaded, isEmpty, useFirestore } from "react-redux-firebase";
import { useFirestoreConnect } from "react-redux-firebase";

import ScrollableFeed from "react-scrollable-feed";
import {} from "react-icons/fi";

import LoadingModal from "../components/LoadingModal";
import BackTopBar from "../components/BackTopBar";
import CharacterChooser from "../components/CharacterChooser";
import RandomCharacterSelector from "../components/RandomCharacterSelector";
import ExistingCharacterSelector from "../components/ExistingCharacterSelector";

const Page: React.FC = () => {
  const firestore = useFirestore();
  const [state, setState] = useState({
    isLoading: true,
    currentSession: null
  });
  const bottomRef = useRef(null);
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

  useEffect(() => {
    if (auth?.uid && sessions) {
      if (sessions && sessions.length >= 1) {
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
        setState({ ...state });
      }
    }
  }, [sessions, auth]);

  useEffect(() => {
    if (isLoaded(auth) && isEmpty(auth)) {
      Router.push("/login");
    }
    setState({ ...state, isLoading: !isLoaded(auth) });
  }, [auth]);

  const scrollToBottom = () => {
    bottomRef.current.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state]);

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
          <div className="w-full flex flex-col px-6 pt-12 pb-8">
            {state.currentSession && (
              <>
                <CharacterChooser currentSession={state.currentSession} />
                {state.currentSession.characterSelectOption === "random" && (
                  <RandomCharacterSelector
                    currentSession={state.currentSession}
                  />
                )}
                {state.currentSession.characterSelectOption === "existing" && (
                  <ExistingCharacterSelector
                    currentSession={state.currentSession}
                  />
                )}
              </>
            )}
          </div>

          <div ref={bottomRef} className="w-full" />
        </ScrollableFeed>
      </div>
    </>
  );
};

export default Page;
