import React, { useEffect, useState, useRef } from "react";
import Head from "next/head";
import Router from "next/router";

import { useSelector } from "react-redux";
import { isLoaded, isEmpty, useFirestore } from "react-redux-firebase";
import { useFirestoreConnect } from "react-redux-firebase";

import ScrollableFeed from "react-scrollable-feed";
import {} from "react-icons/fi";

import Typist from "react-typist";
import TextareaAutosize from "react-textarea-autosize";

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

  const handleAdventureEndOnClick = () => {
    if (state.currentSession && state.currentSession?.id) {
      firestore
        .update(`adventures/${state.currentAdventure.id}`, {
          ended: new Date().toISOString(),
          status: "completed"
        })
        .then(() => {
          firestore.update(`sessions/${state.currentSession.id}`, {
            ended: new Date().toISOString(),
            status: "completed"
          });
        });
    }
  };

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
        <ScrollableFeed className="w-full flex flex-col px-6 pt-12 pb-8">
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
          {state.currentSession?.adventureId && (
            <div className="mt-8">
              <div className="w-full bg-indigo-500 text-white rounded-lg shadow-md p-6">
                <button
                  className="text-2xl font-semibold text-center w-full border border-white rounded-full"
                  onClick={handleAdventureEndOnClick}
                >
                  End Adventure
                </button>
              </div>
            </div>
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

  const handleSelectOptionOnClick = option => {
    if (adventureTextObject && !adventureTextObject?.selectedOption) {
      firestore
        .update(
          `adventures/${state.currentAdventure.id}/adventureTexts/${adventureTextObject.id}`,
          {
            selectedOption: option
          }
        )
        .then(() =>
          firestore.add(
            `adventures/${state.currentAdventure.id}/adventureTexts/`,
            {
              text: (adventureTextObject.text + " " + option.value).replace(
                " s ",
                "'s "
              ),
              isHidden: false,
              options: null,
              createdAt: new Date().toISOString(),
              generateOptions: false,
              cancelled: false,
              generateNext: true
            }
          )
        )
        .then(() =>
          firestore.update(`adventures/${state.currentAdventure.id}`, {
            progression: state.currentAdventure.progression + 1
          })
        );
    }
  };

  return textReady ? (
    !adventureTextObject.generateOptions ? (
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
                  {adventureTextObject?.displayText
                    ? adventureTextObject.displayText
                    : adventureTextObject.text}
                </Typist>
              ) : (
                <>
                  {adventureTextObject?.displayText
                    ? adventureTextObject.displayText
                    : adventureTextObject.text}
                </>
              )}
            </div>
          </div>
        </div>
      </React.Fragment>
    ) : (
      <React.Fragment key={adventureTextObject.id}>
        <div className="mt-8">
          <div className="w-full bg-indigo-500 text-white rounded-lg shadow-md p-6">
            {adventureTextObject.options ? (
              <div className="text-lg text-left">
                {adventureTextObject.options.map((option, optionIdx) => (
                  <div key={optionIdx} className="mb-2">
                    <div
                      className={
                        "border border-white rounded text-lg p-3 flex flex-row " +
                        (adventureTextObject?.selectedOption?.label ===
                          option.label && "bg-white text-indigo-500")
                      }
                      onClick={() => handleSelectOptionOnClick(option)}
                    >
                      <div className="w-8">{optionIdx + 1}.</div>
                      <div className="flex-1">
                        {(
                          adventureTextObject.text +
                          " " +
                          option.label
                        ).replace(" s ", "'s ")}
                      </div>
                    </div>
                  </div>
                ))}

                <CustomInputOption
                  adventureTextObject={adventureTextObject}
                  currentAdventure={state.currentAdventure}
                />
              </div>
            ) : (
              <div className="text-lg text-left">
                <Typist
                  startDelay={1000}
                  cursor={{
                    show: false
                  }}
                  avgTypingDelay={150}
                >
                  Generating options...
                </Typist>
              </div>
            )}
          </div>
        </div>
      </React.Fragment>
    )
  ) : (
    <></>
  );
};

const CustomInputOption = ({ adventureTextObject, currentAdventure }) => {
  const firestore = useFirestore();
  const [state, setState] = useState({
    textareaValue: ""
  });

  const handleSelectOptionOnClick = () => {
    if (adventureTextObject && !adventureTextObject?.selectedOption) {
      firestore
        .update(
          `adventures/${currentAdventure.id}/adventureTexts/${adventureTextObject.id}`,
          {
            selectedOption: {
              label: "custom",
              value: state.textareaValue.trim() + "."
            }
          }
        )
        .then(() =>
          firestore.add(`adventures/${currentAdventure.id}/adventureTexts/`, {
            text: state.textareaValue.trim() + ".",
            isHidden: false,
            options: null,
            createdAt: new Date().toISOString(),
            generateOptions: false,
            cancelled: false,
            generateNext: true
          })
        )
        .then(() =>
          firestore.update(`adventures/${currentAdventure.id}`, {
            progression: currentAdventure.progression + 1
          })
        );
    }
  };
  const handleTextareaOnChange = event => {
    setState({ ...state, textareaValue: event.target.value });
  };
  return (
    <div
      className={
        "w-full p-3 border border-white rounded " +
        (adventureTextObject?.selectedOption?.label === "custom"
          ? "bg-white text-indigo-500"
          : "text-white")
      }
    >
      <div className="flex w-full">
        <div className="w-8">{adventureTextObject.options.length + 1}.</div>
        <TextareaAutosize
          className={
            "w-full text-lg placeholder-indigo-300 " +
            (adventureTextObject?.selectedOption?.label === "custom"
              ? "bg-white"
              : "bg-indigo-500")
          }
          placeholder={"Enter your custom action"}
          value={
            adventureTextObject?.selectedOption?.label === "custom"
              ? "Custom action"
              : state.textareaValue
          }
          onChange={handleTextareaOnChange}
        />
      </div>
      <div className="flex">
        <div className="flex-1" />
        {state.textareaValue.length >= 3 &&
          !(adventureTextObject?.selectedOption?.label === "custom") && (
            <button
              className="py-1 px-2 mt-2 rounded border border-white"
              onClick={handleSelectOptionOnClick}
            >
              Submit
            </button>
          )}
      </div>
    </div>
  );
};

export default Page;
