import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { gql } from "graphql-tag";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { IncomingMessage } from "http";

const SECRET_KEY = "test123"; // Replace with a strong secret

const users = [{ id: 1, username: "sample", password: "$2a$10$samplehash" }]; // Store hashed passwords

// ✅ TypeDefs
const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    token: String
  }

  type Query {
    me: User  # Get current user
  }

  type Mutation {
    register(username: String!, password: String!): User
    login(username: String!, password: String!): User
  }
`;

// ✅ Resolvers
const resolvers = {
  Query: {
    me: (_: any, __: any, { user }: any) => {
      if (!user) throw new Error("Not Authenticated");
      return user;
    },
  },
  Mutation: {
    register: async (_: any, { username, password }: any) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = { id: users.length + 1, username, password: hashedPassword };
      users.push(user);
      const token = jwt.sign({ id: user.id, username }, SECRET_KEY, {
        expiresIn: "1h",
      });
      return { id: user.id, username, token };
    },

    login: async (_: any, { username, password }: any) => {
      const user = users.find((u) => u.username === username);
      if (!user) throw new Error("User not found");
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new Error("Invalid credentials");
      const token = jwt.sign({ id: user.id, username }, SECRET_KEY, {
        expiresIn: "1h",
      });
      return { id: user.id, username, token };
    },
  },
};

// ✅ Middleware to check JWT in requests
const getUser = (req: IncomingMessage) => {
  const token = req.headers.authorization || "";
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (err) {
    return null;
  }
};

// ✅ Start Apollo Server with Authentication Middleware
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req }) => ({ user: getUser(req) }),
}).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
