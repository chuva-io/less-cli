/**
 * Basic MongoDB CRUD operations to get you started.
 */

const { connect } = require('../client');

const insert = async ({ payload, collection }) => {
  const db = await connect();
  const result = await db
    .collection(collection)
    .insertOne(payload);
  return result.insertedId;
};

const get_all = async ({ payload, collection }) => {
  const db = await connect();
  return await db
    .collection(collection)
    .find()
    .toArray();
}

module.exports = {
  insert,
  get_all
};
