const AuthService = require("./auth.service");

const authService = new AuthService();

const queries = {
	getUserToken: async (_, payload) => {
		const token = await authService.loginUser(payload.email, payload.password);
		return token;
	},
	getCurrentLoggedInUser: async (_, parameters, context) => {
		// console.log(context);
		if (context && context.user) {
			return context.user;
		}
		throw new Error("I dont know who are you");
	},
};
const mutations = {
	createUser: async (_, { input }) => {
		// Basic validation
		console.log(input);
		const token = await authService.createUser(input);
		return token;
	},
};

const resolvers = { queries, mutations };
module.exports = resolvers;
