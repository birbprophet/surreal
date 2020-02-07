import React, { useEffect, useState, useRef } from "react";
import Head from "next/head";
import Router from "next/router";

import { useSelector } from "react-redux";
import { isLoaded, isEmpty, useFirestore } from "react-redux-firebase";
import { useFirestoreConnect } from "react-redux-firebase";

import ScrollableFeed from "react-scrollable-feed";
import {} from "react-icons/fi";

import Typist from "react-typist";

import LoadingModal from "../components/LoadingModal";
import BackTopBar from "../components/BackTopBar";
import CharacterChooser from "../components/CharacterChooser";
import RandomCharacterSelector from "../components/RandomCharacterSelector";
import ExistingCharacterSelector from "../components/ExistingCharacterSelector";
import NewCharacterCreator from "../components/NewCharacterCreator";
import AdventureOptionPicker from "../components/AdventureOptionPicker";

const Page: React.FC = () => {
  const firestore = useFirestore();
  const [state, setState] = useState({
    isLoading: true,
    currentSession: null,
    currentAdventure: null,
    adventureTexts: null
  });
  const bottomRef = useRef(null);
  const profile = useSelector(state => state.firebase.profile);
  const auth = useSelector(state => state.firebase.auth);
  useFirestoreConnect([
    {
      collection: "sessions",
      where: [
        ["user", "==", !state.isLoading && auth?.uid ? auth.uid : "NO_UID"],
        ["status", "==", "in progress"]
      ],
      limit: 1
    }
  ]);

  useFirestoreConnect([
    {
      collection: "adventures",
      doc: state?.currentSession?.adventureId || "NO_ID"
    }
  ]);

  useFirestoreConnect([
    {
      collection: `adventures/${state.currentAdventure?.id ||
        "NO_ID"}/adventureTexts`,
      storeAs: "adventureTexts",
      orderBy: ["createdAt", "asc"],
      where: ["cancelled", "==", false]
    }
  ]);

  const sessions = useSelector(state => state.firestore.ordered.sessions);
  const adventures = useSelector(state => state.firestore.ordered.adventures);
  const adventureTexts = useSelector(
    state => state.firestore.ordered.adventureTexts
  );

  useEffect(() => {
    if (
      auth?.uid &&
      state.currentAdventure?.id &&
      adventureTexts &&
      state.adventureTexts !== adventureTexts
    ) {
      setState({ ...state, adventureTexts });
    }
  }, [adventureTexts, auth, state]);

  useEffect(() => {
    if (auth?.uid && adventures) {
      if (adventures && adventures.length >= 1) {
        const sortedAdventures = adventures.sort(
          (a, b) => Object.keys(b).length - Object.keys(a).length
        );
        const currentAdventure = sortedAdventures[0];
        if (sortedAdventures.length > 1) {
          sortedAdventures.slice(1).forEach(adventure => {
            firestore.delete(`adventure/${adventure.id}`);
          });
        }
        if (currentAdventure !== state.currentAdventure) {
          setState({ ...state, currentAdventure });
        }
      }
    }
  }, [adventures, auth]);

  useEffect(() => {
    if (auth?.uid && sessions) {
      if (sessions && sessions.length >= 1) {
        const sortedSessions = sessions
          .sort((a, b) => Object.keys(a).length - Object.keys(b).length)
          .reverse();
        const currentSession = sortedSessions[0];
        if (sortedSessions.length > 1) {
          sortedSessions.slice(1).forEach(session => {
            firestore.delete(`sessions/${session.id}`);
          });
        }
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
    if (state.currentSession?.adventureOption === "new" && auth?.uid) {
      if (!state.currentSession?.adventureId) {
        firestore
          .add("adventures", {
            sessions: [state.currentSession],
            createdBy: auth.uid,
            completed: false,
            progression: 0
          })
          .then(res =>
            firestore.update(`sessions/${state.currentSession.id}`, {
              adventureId: res.id
            })
          );
      }
    }
  }, [state, auth]);

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
        <BackTopBar
          currentSession={state.currentSession}
          currentAdventure={state.currentAdventure}
        />
        <ScrollableFeed className="w-full flex flex-col px-6 pt-12 pb-12">
          {state.currentSession && (
            <>
              <CharacterChooser currentSession={state.currentSession} />
              <div className="mt-8">
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
                {state.currentSession.characterSelectOption === "new" && (
                  <NewCharacterCreator currentSession={state.currentSession} />
                )}
              </div>
              {state.currentSession?.characterConfirmed && (
                <div className="mt-8">
                  <AdventureOptionPicker
                    currentSession={state.currentSession}
                  />
                </div>
              )}
              {state.currentSession?.adventureOption === "new" && (
                <div className="mt-8">
                  <div className="w-full bg-white rounded-lg shadow-md p-6">
                    <div>
                      <div className="text-lg">
                        You can invite friends to join in with your username:
                      </div>
                    </div>
                    <div className="my-2">
                      <div className="text-4xl font-bold">
                        @{profile.username}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {state.currentSession?.adventureId && state.adventureTexts && (
                <div className="mt-8">
                  <div className="w-full bg-indigo-500 text-white rounded-lg shadow-md p-6">
                    <div className="text-2xl font-semibold">
                      Your adventure begins!
                    </div>
                  </div>
                </div>
              )}
              {state.currentSession?.adventureId &&
                state.adventureTexts &&
                state.adventureTexts
                  .filter(item => !item.isHidden)
                  .map((adventureTextObject, idx) => (
                    <AdventureTextComponent
                      adventureTextObject={adventureTextObject}
                      idx={idx}
                      state={state}
                      key={idx}
                    />
                  ))}
            </>
          )}

          <div ref={bottomRef} className="w-full" />
        </ScrollableFeed>
      </div>
    </>
  );
};

const AdventureTextComponent = ({ adventureTextObject, idx, state }) => {
  const firestore = useFirestore();
  const textReady =
    adventureTextObject && idx <= state.currentAdventure.progression;

  const handleOnTypingDone = () => {
    firestore.update(`adventures/${state.currentAdventure.id}`, {
      progression: state.currentAdventure.progression + 1
    });
  };

  return textReady ? (
    <React.Fragment key={adventureTextObject.id}>
      <div className="mt-8">
        <div className="w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-lg">
            {state.currentAdventure.progression === idx ? (
              <Typist
                startDelay={1000}
                cursor={{
                  show: false
                }}
                onTypingDone={handleOnTypingDone}
              >
                {adventureTextObject.text}
              </Typist>
            ) : (
              <>{adventureTextObject.text}</>
            )}
          </div>
        </div>
      </div>
    </React.Fragment>
  ) : adventureTextObject.options ? (
    <>{JSON.stringify(adventureTextObject.options)}</>
  ) : (
    <></>
  );
};

export default Page;
