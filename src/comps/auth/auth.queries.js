const queries = `#graphql
    getUserToken(email: String!, password: String!): String
    getCurrentLoggedInUser: Player
`;
module.exports = queries;
