const mutations = require("./auth.mutations");
const queries = require("./auth.queries");
const resolvers = require("./auth.resolver");
const typeDefs = require("./auth.typedef");

const Auth = { mutations, queries, resolvers, typeDefs };
module.exports = Auth;
