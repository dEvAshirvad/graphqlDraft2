const { assessmentModal } = require("./assessment.modal");
const AssessmentService = require("./assessment.service");

const queries = {
	getMCQ: async (_, { id }) => {
		try {
			const mcq = await assessmentModal.findById(id);
			return mcq;
		} catch (error) {
			throw new Error("Error fetching MCQ");
		}
	},
	get10MCQ: async (_, parameters, context) => {
		if (!(context && context.user)) {
			throw new Error("Unauthorized");
		}
		const mcqArr = await AssessmentService.get10MCQ();
		return mcqArr;
	},
};
const mutations = {
	addMCQ: async (_, { input }) => {
		try {
			const savedMCQ = await AssessmentService.addMCQ(input);
			return savedMCQ;
		} catch (error) {
			throw new Error("Error adding MCQ");
		}
	},
	addBatchMCQs: async (_, { input }) => {
		try {
			// Use insertMany to add multiple MCQs to the database
			const addedMCQs = await assessmentModal.insertMany(input);
			return addedMCQs;
		} catch (error) {
			throw new Error("Error adding batch of MCQs");
		}
	},
};

const resolvers = { queries, mutations };
module.exports = resolvers;
