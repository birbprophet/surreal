const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = admin.firestore();
const fetch = require("node-fetch");

const CORTEX_ENDPOINT =
  "http://ac5295b9448ef11ea94ff02bb5a7c34b-764168958.ap-southeast-1.elb.amazonaws.com/surreal-1558m-48l";

const NUM_OPTIONS = 3;
const SENTENCE_REGEX = /(\w[^.!?]*"[^.!?]*[.!?]*[^.!?]+[.!?]+"\s*)|(\w[^.!?"]+[.!?]+\s*)|("[^.?!]+"[^.?!]+[.!?]+\s*)/gm;

export const createAdventureInitialPrompt = functions.firestore
  .document("/adventures/{adventureDocId}")
  .onCreate(async (snap, context) => {
    const adventureDoc = snap.data();
    const primaryCharacter = adventureDoc.sessions[0].character;

    await db
      .collection("adventures")
      .doc(context.params.adventureDocId)
      .collection("adventureTexts")
      .add({
        text: `Once upon a time, there was ${
          ["a", "e", "i", "o", "u"].includes(
            primaryCharacter.ofType.slice(0, 1)
          )
            ? "an"
            : "a"
        } ${primaryCharacter.ofType} from ${primaryCharacter.fromLocation}. ${
          primaryCharacter.pronoun === "she" ? "Her" : "His"
        } name was
          ${primaryCharacter.displayName}.\n\n`,
        isHidden: true,
        options: null,
        createdAt: new Date().toISOString(),
        generateOptions: false,
        cancelled: false
      });

    await db
      .collection("adventures")
      .doc(context.params.adventureDocId)
      .collection("adventureTexts")
      .add({
        text: `One day, `,
        isHidden: false,
        options: null,
        createdAt: new Date().toISOString(),
        generateOptions: false,
        cancelled: false
      });

    await db
      .collection("adventures")
      .doc(context.params.adventureDocId)
      .collection("adventureTexts")
      .add({
        text: `${primaryCharacter.displayName}`,
        isHidden: false,
        options: null,
        createdAt: new Date().toISOString(),
        generateOptions: true,
        cancelled: false
      });

    return;
  });

export const populateOptions = functions.firestore
  .document("/adventures/{adventureDocId}/adventureTexts/{adventureTextId}")
  .onCreate(async (snap, context) => {
    const adventureTextDoc = snap.data();
    const generateOptions = adventureTextDoc?.generateOptions;

    if (!generateOptions) {
      return;
    }

    const adventureDocTextDocs = await db
      .collection("adventures")
      .doc(context.params.adventureDocId)
      .collection("adventureTexts")
      .where("cancelled", "==", false)
      .orderBy("createdAt", "asc")
      .get()
      .then(query => query.docs.map(doc => doc.data()))
      .catch(error => {
        console.log("Error getting document:", error);
      });

    const adventureDocTexts: string[] = [];
    adventureDocTextDocs.forEach(element => {
      adventureDocTexts.push(element.text);
    });

    const cortexPrompt = adventureDocTexts.reduce((prevValue, currentValue) => {
      if (!prevValue.length) {
        return currentValue;
      }
      if (prevValue.endsWith("\n\n")) {
        return prevValue + currentValue;
      }
      return prevValue + " " + currentValue;
    }, "");

    const optionPromises = Array.from(Array(NUM_OPTIONS * 2), async () => {
      console.log("sending request...");

      const result = await fetch(CORTEX_ENDPOINT, {
        method: "post",
        body: JSON.stringify({ text: cortexPrompt }),
        headers: { "Content-Type": "application/json" }
      }).then(res => res.json());
      if (result.includes("<|endoftext|>")) {
        return null;
      }
      const matches = result.replace(cortexPrompt, "").match(SENTENCE_REGEX);
      if (matches) {
        const option = matches.join("");
        return option;
      } else {
        return null;
      }
    });

    const optionTexts = await Promise.all(optionPromises);
    const filteredOptionTexts = optionTexts.filter(item => item);
    const optionObjects = filteredOptionTexts
      .map(optionText => {
        return {
          label: optionText.split(/[.,!:]/)[0],
          value: optionText
        };
      })
      .sort((a, b) => a.label.length - b.label.length)
      .slice(0, NUM_OPTIONS);

    await db
      .collection("adventures")
      .doc(context.params.adventureDocId)
      .collection("adventureTexts")
      .doc(context.params.adventureTextId)
      .update({ options: optionObjects });

    return;
  });
