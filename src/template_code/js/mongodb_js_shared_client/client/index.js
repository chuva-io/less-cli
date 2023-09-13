// `mongodb` GitHub repo: https://github.com/mongodb/node-mongodb-native
const { MongoClient } = require('mongodb');

const { MONGO_DB_URI, MONGO_DB_NAME } = process.env;

// Used to cache the database connection.
let client;

/**
 * Connect to Mongo database.
 * Returns the database.
 */
const connect = async () => {
  // Create client if it doesn't exist.
  if (!client) {
    client = new MongoClient(MONGO_DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
  }

  return client.db(MONGO_DB_NAME);
};

module.exports = {
  connect
};
