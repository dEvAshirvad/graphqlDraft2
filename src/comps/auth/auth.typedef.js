const typeDefs = `#graphql
    type User {
        _id: ID!,
        name: String!,
        email: String!,
        password: String!, # Note: In production, you should not expose the password like this. Use hashing and proper authentication.
        accessToken: String!,
        createdAt: String!,
        username: String!
    }
    type Player {
        name: String!,
        email: String!,
        username: String!
    }
    input CreateUserInput {
        name: String!
        email: String!
        password: String!
        username: String!
    }
`;
module.exports = typeDefs;
