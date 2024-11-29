const functions = require("firebase-functions");
const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const admin = require("firebase-admin");

admin.initializeApp();
const app = express();

const schema = buildSchema(`
  type User {
    uid: String
    email: String
  }

  type Query {
    user(uid: String!): User
  }
`);

const root = {
  user: async ({ uid }) => {
    try {
      const userRecord = await admin.auth().getUser(uid);
      return {
        uid: userRecord.uid,
        email: userRecord.email,
      };
    } catch (error) {
      throw new Error("Kullanıcı bulunamadı veya erişim hatası oluştu");
    }
  },
};

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
);

exports.api = functions.https.onRequest(app);