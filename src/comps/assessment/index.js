const mutations = require("./assessment.mutations");
const queries = require("./assessment.queries");
const resolvers = require("./assessment.resolver");
const typeDefs = require("./assessment.typedef");

const Assessment = { mutations, queries, resolvers, typeDefs };
module.exports = Assessment;
