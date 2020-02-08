const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = admin.firestore();
const fetch = require("node-fetch");

const CORTEX_ENDPOINT =
  "http://ac5295b9448ef11ea94ff02bb5a7c34b-764168958.ap-southeast-1.elb.amazonaws.com/surreal-1558m-48l";

const NUM_OPTIONS = 3;
const MAX_CHAIN = 10;
const SENTENCE_REGEX = /(\w[^.!?]*["'][^.!?]*[.!?]*[^.!?]+[.!?]+["']\s*)|(\w[^.!?"']+[.!?]+\s*)|(["'][^.?!]+["'][^.?!]+[.!?]+\s*)/gm;

export const createAdventureInitialPrompt = functions
  .runWith({ memory: "512MB", timeoutSeconds: 120 })
  .firestore.document("/adventures/{adventureDocId}")
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
        } ${primaryCharacter.ofType}. The ${
          primaryCharacter.ofType
        }'s name was ${primaryCharacter.displayName}, and ${
          primaryCharacter.pronoun === "she" ? "her" : "his"
        } was from ${primaryCharacter.fromLocation}.\n\n`,
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
        displayText: "One day...",
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

export const populateOptions = functions
  .runWith({ memory: "512MB", timeoutSeconds: 120 })
  .firestore.document(
    "/adventures/{adventureDocId}/adventureTexts/{adventureTextId}"
  )
  .onCreate(async (snap, context) => {
    const adventureTextDoc = snap.data();
    const generateOptions = adventureTextDoc?.generateOptions;

    const adventureEnd = adventureTextDoc?.adventureEnd;

    if (!generateOptions || adventureEnd) {
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

    const rawAdventureDocTexts: string[] = [];
    adventureDocTextDocs.forEach(element => {
      rawAdventureDocTexts.push(element.text);
    });

    let adventureDocTexts;

    if (rawAdventureDocTexts.length > MAX_CHAIN) {
      adventureDocTexts = [
        rawAdventureDocTexts[0],
        ...rawAdventureDocTexts.slice(
          rawAdventureDocTexts.length - MAX_CHAIN + 1,
          rawAdventureDocTexts.length
        )
      ];
    } else {
      adventureDocTexts = rawAdventureDocTexts;
    }

    const cortexPrompt = adventureDocTexts.reduce((prevValue, currentValue) => {
      if (!prevValue.length) {
        return currentValue;
      }
      if (prevValue.endsWith("\n\n")) {
        return prevValue + currentValue;
      }
      return prevValue + " " + currentValue;
    }, "");

    const adventureDoc = await db
      .collection("adventures")
      .doc(context.params.adventureDocId)
      .get()
      .then(doc => doc.data());

    const primaryCharacter = adventureDoc.sessions[0].character;

    const optionPromises = Array.from(Array(NUM_OPTIONS * 2), async () => {
      console.log(
        `sending request... ${JSON.stringify({ text: cortexPrompt })}`
      );
      try {
        const result = await fetch(CORTEX_ENDPOINT, {
          method: "post",
          body: JSON.stringify({ text: cortexPrompt }),
          headers: { "Content-Type": "application/json" }
        }).then(res => res.json());
        if (
          result.includes("<|endoftext|>") ||
          result.includes('"') ||
          result.includes("(") ||
          result.includes(")") ||
          result.includes(":") ||
          result.split(" ").includes("I")
        ) {
          return null;
        }
        const matches = result.replace(cortexPrompt, "").match(SENTENCE_REGEX);
        if (matches) {
          const option = matches.join("");
          if (option.includes(primaryCharacter.name)) {
            return null;
          }
          return option;
        } else {
          return null;
        }
      } catch (error) {
        console.log(error);
        return null;
      }
    });

    const optionTexts = await Promise.all(optionPromises);
    const filteredOptionTexts = optionTexts.filter(item => item);

    const optionObjects = filteredOptionTexts
      .map(optionText => {
        const cleanedOptionText = optionText
          .replace(`${primaryCharacter.displayName}`, ``)
          .replace(`${primaryCharacter.displayName}`, ``)
          .replace(`${primaryCharacter.displayName}`, ``)
          .trim();
        return {
          label: cleanedOptionText.split(/[.,!:]/)[0].replace(/  /g, " "),
          value: cleanedOptionText.replace(/  /g, " ")
        };
      })
      .sort((a, b) => a.label.length - b.label.length)
      .slice(0, NUM_OPTIONS);

    if (optionObjects.length > 0) {
      await db
        .collection("adventures")
        .doc(context.params.adventureDocId)
        .collection("adventureTexts")
        .doc(context.params.adventureTextId)
        .update({ options: optionObjects });
    } else {
      await db
        .collection("adventures")
        .doc(context.params.adventureDocId)
        .collection("adventureTexts")
        .doc(context.params.adventureTextId)
        .update({
          options: []
        });
    }
    return;
  });

export const generateNext = functions
  .runWith({ memory: "512MB", timeoutSeconds: 120 })
  .firestore.document(
    "/adventures/{adventureDocId}/adventureTexts/{adventureTextId}"
  )
  .onCreate(async (snap, context) => {
    const adventureTextDoc = snap.data();
    const generateNext = adventureTextDoc?.generateNext;

    const adventureEnd = adventureTextDoc?.adventureEnd;

    if (!generateNext || adventureEnd) {
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

    const rawAdventureDocTexts: string[] = [];
    adventureDocTextDocs.forEach(element => {
      rawAdventureDocTexts.push(element.text);
    });

    let adventureDocTexts;

    if (rawAdventureDocTexts.length > MAX_CHAIN) {
      adventureDocTexts = [
        rawAdventureDocTexts[0],
        ...rawAdventureDocTexts.slice(
          rawAdventureDocTexts.length - MAX_CHAIN + 1,
          rawAdventureDocTexts.length
        )
      ];
    } else {
      adventureDocTexts = rawAdventureDocTexts;
    }

    const cortexPrompt = adventureDocTexts.reduce((prevValue, currentValue) => {
      if (!prevValue.length) {
        return currentValue;
      }
      if (prevValue.endsWith("\n\n")) {
        return prevValue + currentValue;
      }
      return prevValue + " " + currentValue;
    }, "");

    let option = "";
    try {
      console.log(
        `sending request... ${JSON.stringify({ text: cortexPrompt })}`
      );
      const result = await fetch(CORTEX_ENDPOINT, {
        method: "post",
        body: JSON.stringify({ text: cortexPrompt }),
        headers: { "Content-Type": "application/json" }
      }).then(res => res.json());
      if (
        !(
          result.includes("<|endoftext|>") ||
          result.includes('"') ||
          result.includes("(") ||
          result.includes(")") ||
          result.includes(":") ||
          result.split(" ").includes("I")
        )
      ) {
        const matches = result.replace(cortexPrompt, "").match(SENTENCE_REGEX);
        if (matches) {
          option = matches.join("");
        }
      }
    } catch (error) {
      console.log(error);
    }

    const adventureDoc = await db
      .collection("adventures")
      .doc(context.params.adventureDocId)
      .get()
      .then(doc => doc.data());

    const primaryCharacter = adventureDoc.sessions[0].character;

    if (option.length > 0) {
      await db
        .collection("adventures")
        .doc(context.params.adventureDocId)
        .collection("adventureTexts")
        .add({
          text: option
            .replace(
              `${primaryCharacter.displayName} ${primaryCharacter.displayName}`,
              `${primaryCharacter.displayName}`
            )
            .replace(
              `${primaryCharacter.displayName} ${primaryCharacter.displayName}`,
              `${primaryCharacter.displayName}`
            )
            .replace(
              `${primaryCharacter.displayName} ${primaryCharacter.displayName}`,
              `${primaryCharacter.displayName}`
            ),
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
    } else {
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
    }

    return;
  });
