const typeDefs = `#graphql
    type MCQ {
        _id: ID!,
        question: String!,
        options: [String!]!,
        subject: String!,
        topic: String!,
        correctAnswer: String!
    }
    type Events {
        title: String!,
        eventBy: Player!
        createdAt: String!,
    }
    type Room {
        _id: ID!,
        players: [Player]!,
        mcq: [MCQ]!,
        vacant: Boolean!,
        events: [Events],
        createdAt: String!,
        updatedAt: String!
    }
    input AddMCQInput {
    question: String!
    options: [String!]!
    subject: String!
    topic: String!
    correctAnswer: String!
  }
`;
module.exports = typeDefs;
