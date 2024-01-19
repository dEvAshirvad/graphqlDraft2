const { assessmentModal, roomModal } = require("./assessment.modal");

require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });
const timestamp = new Date().toISOString();

const shuffleArray = (array) => {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
};

const getUniqueRandomIndices = (maxIndex, count) => {
	const indices = Array.from({ length: maxIndex }, (_, index) => index);
	return shuffleArray(indices).slice(0, count);
};

const AssessmentService = {
	addMCQ: async ({ question, options, subject, topic, correctAnswer }) => {
		try {
			// Create a new MCQ document
			if (!question || !options || !subject || !topic || !correctAnswer) {
				throw new Error("All fields are required");
			}
			const newMCQ = new assessmentModal({
				question,
				options,
				subject,
				topic,
				correctAnswer,
			});

			// Save the MCQ to the database
			const savedMCQ = await newMCQ.save();

			return savedMCQ;
		} catch (error) {
			throw new Error("Error adding MCQ to the assessment database");
		}
	},
	get10MCQ: async () => {
		try {
			// Get unique subjects
			const uniqueSubjects = await assessmentModal.distinct("subject");

			// Initialize an array to store selected MCQs
			let selectedMCQs = [];

			// Calculate the number of MCQs to get for each subject
			const mcqsPerSubject = Math.ceil(10 / uniqueSubjects.length);

			// Fetch 10 MCQs, randomly selected among subjects
			await Promise.all(
				uniqueSubjects.map(async (subject) => {
					const subjectMCQs = await assessmentModal.find({ subject }).lean();

					// Get random indices from the subjectMCQs array
					const randomIndices = getUniqueRandomIndices(
						subjectMCQs.length,
						mcqsPerSubject
					);

					// Push the randomly selected MCQs into the selectedMCQs array
					selectedMCQs = selectedMCQs.concat(
						randomIndices.map((index) => subjectMCQs[index])
					);
				})
			);

			// Shuffle the selected MCQs to ensure randomness
			selectedMCQs = shuffleArray(selectedMCQs);

			// Slice the array to get exactly 10 MCQs
			selectedMCQs = selectedMCQs.slice(0, 10);

			return selectedMCQs;
		} catch (error) {
			throw new Error("Error fetching 10 MCQs");
		}
	},
	async createRoom(player) {
		try {
			const existingRoom = await roomModal.findOne({
				players: { $in: [player.email] },
			});
			// console.log(existingRoom);
			if (existingRoom) {
				return existingRoom;
			}

			const newRoom = new roomModal({
				players: [player.email],
				vacant: "true",
				mcq: [],
				gamestarted: "false",
				events: [
					{
						title: `Room created by ${player.name}`,
						eventBy: player.email,
						createdAt: timestamp,
					},
				],
				createdAt: timestamp,
				updatedAt: timestamp,
			});

			const savedRoom = await newRoom.save();
			return savedRoom;
		} catch (error) {
			throw new Error(`Error creating room: ${error.message}`);
		}
	},
	async getRoom(roomId) {
		try {
			const room = await roomModal.findById(roomId);

			if (!room) {
				throw new Error("Room not found");
			}

			return room;
		} catch (error) {
			throw new Error(`Error getting room: ${error.message}`);
		}
	},
	async addPlayer(roomId, newPlayer) {
		try {
			const existingRoom = await roomModal.findOne({
				vacant: "false",
				players: { $in: [newPlayer.email] },
			});

			if (existingRoom) {
				return existingRoom;
			}
			const updatedRoom = await roomModal.findOneAndUpdate(
				{ _id: roomId },
				{
					$push: { players: newPlayer.email },
					$set: {
						vacant: "false",
						updatedAt: timestamp,
					},
					$addToSet: {
						events: {
							title: `Opponent is added: ${newPlayer.email}`,
							eventBy: newPlayer.email,
							createdAt: timestamp,
						},
					},
				},
				{ new: true }
			);

			if (!updatedRoom) {
				throw new Error("Room not found");
			}

			return updatedRoom;
		} catch (error) {
			throw new Error(`Error adding player: ${error.message}`);
		}
	},
	async addMCQToRoom(roomId) {
		try {
			const mcqs = await this.get10MCQ();
			const updatedRoom = await roomModal.findOneAndUpdate(
				{ _id: roomId },
				{
					$set: {
						gamestarted: "true",
						mcq: [...mcqs],
						updatedAt: timestamp,
					},
					$addToSet: {
						events: {
							title: `MCQ is added`,
							eventBy: "system",
							createdAt: timestamp,
						},
						events: {
							title: "Game started",
							eventBy: "system",
							createdAt: timestamp,
						},
					},
				},
				{ new: true }
			);

			if (!updatedRoom) {
				throw new Error("Room not found");
			}

			return updatedRoom;
		} catch (error) {
			throw new Error(`Error adding MCQ: ${error.message}`);
		}
	},
	async findVacantRoom(email) {
		try {
			const vacantRoom = await roomModal.findOne({ vacant: "true" });

			if (!vacantRoom || vacantRoom.players.includes(email)) {
				return false;
			}

			return vacantRoom;
		} catch (error) {
			throw new Error(`Error finding vacant room: ${error.message}`);
		}
	},
};

module.exports = AssessmentService;
