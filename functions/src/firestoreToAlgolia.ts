const functions = require("firebase-functions");
const algoliasearch = require("algoliasearch");

const algoliaFunctions = require("algolia-firebase-functions");

const ALGOLIA_ID = functions.config().algolia.app_id;
const ALGOLIA_ADMIN_KEY = functions.config().algolia.api_key;

const client = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);

export const syncCharactersWithAlgolia = functions.firestore
  .document("/characters/{childDocument}")
  .onWrite((change, context) => {
    const index = client.initIndex("surreal_characters");
    algoliaFunctions.syncAlgoliaWithFirestore(index, change);
  });

export const syncUsersWithAlgolia = functions.firestore
  .document("/users/{childDocument}")
  .onWrite((change, context) => {
    const index = client.initIndex("surreal_users");
    algoliaFunctions.syncAlgoliaWithFirestore(index, change);
  });
