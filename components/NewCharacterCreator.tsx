import React, { useEffect, useState } from "react";

import { useSelector } from "react-redux";
import { useFirestore } from "react-redux-firebase";
import { useFirestoreConnect } from "react-redux-firebase";

import algoliasearch from "algoliasearch/lite";

import TextTruncate from "react-text-truncate";
import { FiSearch, FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";

import CharacterSelectButton from "./subcomponents/CharacterSelectButton";
import CharacterSelectBottomUndo from "./subcomponents/CharacterSelectBottomUndo";

const NewCharacterCreator: React.FC<{ currentSession: any }> = ({
  currentSession
}) => {
  const firestore = useFirestore();
  const auth = useSelector(state => state.firebase.auth);
  const [state, setState] = useState({
    characterDetails: {
      name: null,
      displayName: null,
      ofType: null,
      fromLocation: null,
      pronoun: null
    },
    characterDetailsValidity: {
      name: false,
      displayName: false,
      ofType: false,
      fromLocation: false,
      pronoun: false
    },
    pageNum: 0,
    createdCharacterId: null
  });

  useFirestoreConnect([
    {
      collection: "characters",
      doc: state.createdCharacterId || "NO_ID",
      storeAs: "createdCharacters"
    }
  ]);

  const createdCharacters = useSelector(
    state => state.firestore.ordered.createdCharacters
  );

  useEffect(() => {
    if (currentSession.character && !state.createdCharacterId) {
      setState({ ...state, createdCharacterId: currentSession.character.id });
    }
  }, [currentSession]);

  useEffect(() => {
    if (
      createdCharacters &&
      createdCharacters.length > 0 &&
      state.createdCharacterId
    ) {
      const createdCharacter = createdCharacters[0];
      if (currentSession.character?.id !== createdCharacter.id) {
        firestore.update(`sessions/${currentSession.id}`, {
          character: createdCharacter,
          characterConfirmed: true
        });
      }
    }
  }, [state, createdCharacters, currentSession]);

  const inputOrder = [
    "name",
    "displayName",
    "ofType",
    "fromLocation",
    "pronoun"
  ];

  const validityCheckers = {
    name: value => value.length >= 1,
    displayName: value => value.length >= 1,
    ofType: value => value.length >= 1,
    fromLocation: value => value.length >= 1,
    pronoun: value => ["he", "she"].includes(value)
  };

  const handleBackOnClick = () => {
    if (state.pageNum > 0) {
      setState({ ...state, pageNum: state.pageNum - 1 });
    }
  };

  const handleNextOnClick = () => {
    if (state.pageNum + 1 < inputOrder.length) {
      setState({ ...state, pageNum: state.pageNum + 1 });
    }
  };

  const handleInputOnChange = field => event => {
    const validity = validityCheckers[field](event.target.value);
    setState({
      ...state,
      characterDetails: {
        ...state.characterDetails,
        [field]: event.target.value
      },
      characterDetailsValidity: {
        ...state.characterDetailsValidity,
        [field]: validity
      }
    });
  };

  const handlePronounChange = pronoun => {
    const field = "pronoun";
    const validity = validityCheckers[field](pronoun);
    setState({
      ...state,
      characterDetails: {
        ...state.characterDetails,
        [field]: pronoun
      },
      characterDetailsValidity: {
        ...state.characterDetailsValidity,
        [field]: validity
      }
    });
  };

  const handleCreateCharacter = () => {
    if (auth?.uid) {
      const characterEntry = {
        ...state.characterDetails,
        isPublic: false,
        inRandomPool: false,
        usedCount: 0,
        createdBy: auth.uid
      };
      firestore.add("characters", characterEntry).then(res =>
        setState({
          ...state,
          createdCharacterId: res.id
        })
      );
    }
  };

  return (
    <>
      <div className="w-full bg-white p-6 mt-8 shadow-lg rounded-lg flex flex-col">
        <div>
          <div className="text-2xl font-semibold">
            {state.createdCharacterId
              ? "Character Created"
              : "Character Creation"}
          </div>
          {currentSession.character && (
            <>
              <div className="text-4xl font-bold pr-4 pt-2 leading-tight flex mt-4">
                <div className="m-auto text-center">
                  {currentSession.character
                    ? currentSession.character.name
                    : "Loading..."}
                </div>
              </div>
              <div className="flex my-4">
                <div className="text-lg text-center m-auto">
                  {currentSession.character ? (
                    <TextTruncate
                      line={2}
                      element="span"
                      truncateText="…"
                      text={`${currentSession.character.displayName} is ${
                        ["a", "e", "i", "o", "u"].includes(
                          currentSession.character.ofType.slice(0, 1)
                        )
                          ? "an"
                          : "a"
                      } ${currentSession.character.ofType} from ${
                        currentSession.character.fromLocation
                      }`}
                    />
                  ) : (
                    "Loading description..."
                  )}
                </div>
              </div>
            </>
          )}
          {!state.createdCharacterId && (
            <>
              <div className="h-24">
                {inputOrder[state.pageNum] === "name" && (
                  <FullNameInputSection
                    state={state}
                    handleChange={handleInputOnChange(
                      inputOrder[state.pageNum]
                    )}
                  />
                )}
                {inputOrder[state.pageNum] === "displayName" && (
                  <DisplayNameInputSection
                    state={state}
                    handleChange={handleInputOnChange(
                      inputOrder[state.pageNum]
                    )}
                  />
                )}
                {inputOrder[state.pageNum] === "ofType" && (
                  <OfTypeInputSection
                    state={state}
                    handleChange={handleInputOnChange(
                      inputOrder[state.pageNum]
                    )}
                  />
                )}
                {inputOrder[state.pageNum] === "fromLocation" && (
                  <FromLocationInputSection
                    state={state}
                    handleChange={handleInputOnChange(
                      inputOrder[state.pageNum]
                    )}
                  />
                )}
                {inputOrder[state.pageNum] === "pronoun" && (
                  <PronounInputSection
                    state={state}
                    handleChange={handlePronounChange}
                  />
                )}
              </div>
              <div className="mt-8">
                <div className="w-full flex flex-row">
                  {state.pageNum > 0 ? (
                    <button
                      className={
                        "flex rounded-full py-2 text-lg font-semibold bg-white text-indigo-500 border border-indigo-500 px-2"
                      }
                      onClick={handleBackOnClick}
                    >
                      <FiChevronLeft className="mt-1 mr-1" size={20} />
                      <div className="mr-2">Back</div>
                    </button>
                  ) : (
                    <></>
                  )}
                  <div className="flex-1" />
                  <div>
                    {state.characterDetailsValidity[
                      inputOrder[state.pageNum]
                    ] && state.pageNum + 1 < inputOrder.length ? (
                      <button
                        className={
                          "flex rounded-full py-2 text-lg font-semibold text-white bg-indigo-500 border border-indigo-500 px-2"
                        }
                        onClick={handleNextOnClick}
                      >
                        <div className="ml-2">Next</div>
                        <FiChevronRight className="mt-1 ml-1" size={20} />
                      </button>
                    ) : (
                      state.pageNum + 1 < inputOrder.length && (
                        <button
                          className={
                            "flex rounded-full py-2 text-lg font-semibold text-gray-300 bg-gray-100 border border-gray-100 px-2"
                          }
                        >
                          <div className="ml-2">Next</div>
                          <FiChevronRight className="mt-1 ml-1" size={20} />
                        </button>
                      )
                    )}
                    {Object.values(state.characterDetailsValidity).every(
                      v => v
                    ) &&
                      state.pageNum + 1 === inputOrder.length && (
                        <button
                          className={
                            "flex rounded-full py-2 text-lg font-semibold text-white bg-indigo-500 border border-indigo-500 px-2"
                          }
                          onClick={handleCreateCharacter}
                        >
                          <div className="ml-2">Create</div>
                          <FiChevronRight className="mt-1 ml-1" size={20} />
                        </button>
                      )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

const FullNameInputSection: React.FC<{
  state: any,
  handleChange: { (event): void }
}> = ({ state, handleChange }) => {
  const inputField = "name";
  return (
    <>
      <div className="mt-4">
        <div className="text-lg">Your character's full name is:</div>
      </div>
      <div className="mt-4">
        <input
          type="text"
          className="text-xl border-b border-gray-500 w-full"
          maxLength={24}
          onChange={handleChange}
          value={state.characterDetails[inputField] || ""}
          placeholder="e.g. Thomas the Tank Engine"
        />
        <div className="text-gray-500 mt-2">
          <i>* case-sensitive</i>
        </div>
      </div>
    </>
  );
};

const DisplayNameInputSection: React.FC<{
  state: any,
  handleChange: { (event): void }
}> = ({ state, handleChange }) => {
  const inputField = "displayName";
  return (
    <>
      <div className="mt-4">
        <div className="text-lg">Commonly known as:</div>
      </div>
      <div className="mt-4">
        <input
          type="text"
          className="text-xl border-b border-gray-500 w-full"
          maxLength={12}
          onChange={handleChange}
          value={state.characterDetails[inputField] || ""}
          placeholder="e.g. Thomas"
        />
        <div className="text-gray-500 mt-2">
          <i>* case-sensitive</i>
        </div>
      </div>
    </>
  );
};

const OfTypeInputSection: React.FC<{
  state: any,
  handleChange: { (event): void }
}> = ({ state, handleChange }) => {
  const inputField = "ofType";
  return (
    <>
      <div className="mt-4">
        <div className="text-lg">{`${state.characterDetails.displayName} is...`}</div>
      </div>
      <div className="mt-4">
        <input
          type="text"
          className="text-xl border-b border-gray-500 w-full"
          maxLength={24}
          onChange={handleChange}
          value={state.characterDetails[inputField] || ""}
          placeholder="e.g. a sentient locomotive"
        />
        <div className="text-white mt-2">
          <i>* case-sensitive</i>
        </div>
      </div>
    </>
  );
};

const FromLocationInputSection: React.FC<{
  state: any,
  handleChange: { (event): void }
}> = ({ state, handleChange }) => {
  const inputField = "fromLocation";
  return (
    <>
      <div className="mt-4">
        <div className="text-lg">{`${state.characterDetails.displayName} is from...`}</div>
      </div>
      <div className="mt-4">
        <input
          type="text"
          className="text-xl border-b border-gray-500 w-full"
          maxLength={24}
          onChange={handleChange}
          value={state.characterDetails[inputField] || ""}
          placeholder="e.g. the train station"
        />
        <div className="text-white mt-2">
          <i>* case-sensitive</i>
        </div>
      </div>
    </>
  );
};

const PronounInputSection: React.FC<{
  state: any,
  handleChange: { (event): void }
}> = ({ state, handleChange }) => {
  const inputField = "pronoun";

  return (
    <>
      <div className="mt-4">
        <div className="text-lg">{`${state.characterDetails.displayName}'s pronoun is...`}</div>
      </div>
      <div className="mt-4">
        <div className="flex">
          <div className="pr-2">
            <button
              className={
                "px-4 bg-white rounded-full text-lg " +
                (state.characterDetails.pronoun === "he"
                  ? "text-white bg-indigo-500 border-indigo-500"
                  : "text-indigo-500 border border-indigo-500")
              }
              onClick={() => handleChange("he")}
            >
              he / him
            </button>
          </div>
          <div className="pr-2">
            <button
              className={
                "px-4 bg-white rounded-full text-lg " +
                (state.characterDetails.pronoun === "she"
                  ? "text-white bg-indigo-500 border-indigo-500"
                  : "text-indigo-500 border border-indigo-500")
              }
              onClick={() => handleChange("she")}
            >
              she / her
            </button>
          </div>
        </div>
        <div className="text-gray-500 mt-2 text-sm">
          <i>* AI model only recognises binary pronouns</i>
        </div>
      </div>
    </>
  );
};

export default NewCharacterCreator;
