const mutations = `#graphql
     addMCQ(input: AddMCQInput): MCQ
     addBatchMCQs(input: [AddMCQInput]): [MCQ]
`;
module.exports = mutations;
