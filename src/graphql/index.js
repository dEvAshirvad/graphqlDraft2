const { ApolloServer } = require("@apollo/server");
const Auth = require("../comps/auth");
const Assessment = require("../comps/assessment");

async function createGraphqlServer() {
	const gqlServer = new ApolloServer({
		typeDefs: `
            ${Auth.typeDefs}
			${Assessment.typeDefs}
            type Query {
                ${Auth.queries}
                ${Assessment.queries}
            }
            type Mutation {
                ${Auth.mutations}
                ${Assessment.mutations}
            }
        `,
		resolvers: {
			Query: {
				...Auth.resolvers.queries,
				...Assessment.resolvers.queries,
			},
			Mutation: {
				...Auth.resolvers.mutations,
				...Assessment.resolvers.mutations,
			},
		},
	});

	await gqlServer.start();

	return gqlServer;
}

module.exports = createGraphqlServer;
