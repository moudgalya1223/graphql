import { PrismaClient } from '@prisma/client';
import { createYoga } from '@graphql-yoga/node';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { createServer } from 'http';

const prisma = new PrismaClient();

// GraphQL Schema
const typeDefs = /* GraphQL */ `
  type User {
    id: Int!
    name: String!
    email: String!
    posts: [Post!]!
  }

  type Post {
    id: Int!
    title: String!
    content: String!
    published: Boolean!
    author: User!
  }

  type Query {
    users: [User!]!
    posts: [Post!]!
  }

  type Mutation {
    # User CRUD Operations
    createUser(name: String!, email: String!): User!
    updateUser(id: Int!, name: String, email: String): User!
    deleteUser(id: Int!): User!

    # Post CRUD Operations
    createPost(title: String!, content: String!, authorId: Int!): Post!
    updatePost(id: Int!, title: String, content: String, published: Boolean): Post!
    deletePost(id: Int!): Post!
  }
`;

// Resolvers
const resolvers = {
  Query: {
    users: () => prisma.user.findMany({ include: { posts: true } }),
    posts: () => prisma.post.findMany({ include: { author: true } }),
  },
  Mutation: {
    createUser: (_: any, { name, email }: any) =>
      prisma.user.create({
        data: { name, email },
      }),
    updateUser: (_: any, { id, name, email }: any) =>
      prisma.user.update({
        where: { id },
        data: { ...(name && { name }), ...(email && { email }) },
      }),
    deleteUser: (_: any, { id }: any) =>
      prisma.user.delete({
        where: { id },
      }),
    createPost: (_: any, { title, content, authorId }: any) =>
      prisma.post.create({
        data: { title, content, author: { connect: { id: authorId } } },
      }),
    updatePost: (_: any, { id, title, content, published }: any) =>
      prisma.post.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(content && { content }),
          ...(published !== undefined && { published }),
        },
      }),
    deletePost: (_: any, { id }: any) =>
      prisma.post.delete({
        where: { id },
      }),
  },
  User: {
    posts: (parent: any) =>
      prisma.post.findMany({ where: { authorId: parent.id } }),
  },
  Post: {
    author: (parent: any) =>
      prisma.user.findUnique({ where: { id: parent.authorId } }),
  },
};

// Create executable schema
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Create server instance using createYoga
const yoga = createYoga({
  schema,
});

const server = createServer(yoga);

// Start the server
server.listen(4000, () => {
  console.log('GraphQL server is running on http://localhost:4000');
});

// Function to seed the database
async function seedDatabase() {
  try {
    const user = await prisma.user.create({
      data: {
        name: 'Alice',
        email: 'alice@example.com',
        posts: {
          create: [
            { title: 'First Post', content: 'Hello world!', published: true },
            { title: 'Second Post', content: 'More to come!', published: false },
          ],
        },
      },
    });
    console.log('User seeded:', user);
  } catch (e) {
    console.error('Error seeding database:', e);
  }
}

// Call the seeding function
seedDatabase().finally(() => prisma.$disconnect());
