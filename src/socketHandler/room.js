const { roomModal } = require("../comps/assessment/assessment.modal");
const AssessmentService = require("../comps/assessment/assessment.service");
const AuthService = require("../comps/auth/auth.service");
const authService = new AuthService();
const roomHandler = (io, socket) => {
	console.log("A user connected", socket.id);
	socket.on("join-room", async (accessToken) => {
		const user = await authService.decodeJWTToken(accessToken);
		const vacantRoom = await AssessmentService.findVacantRoom(user.email);
		const existingRoom = await roomModal.findOne({
			players: { $in: [user.email] },
		});

		if (!(existingRoom && existingRoom?.gamestarted === "true")) {
			if (!vacantRoom && (!existingRoom || existingRoom?.vacant === "true")) {
				console.log("room creating");
				const room = await AssessmentService.createRoom(user);
				socket.join(room._id);
				io.to(room._id).emit("room-created", { roomId: room._id });
			} else {
				console.log("room joining");
				const room = await AssessmentService.addPlayer(vacantRoom._id, user);
				socket.join(room._id);
				io.to(room._id).emit("room-joined", { roomId: room._id });

				const updatedRoom = await AssessmentService.addMCQToRoom(room._id);
				io.to(room._id).emit("game-start", {
					roomId: room._id,
					room: updatedRoom,
				});
			}
		} else {
			console.log("game started");
		}
	});
	socket.on("left", () => {
		console.log("User left");
	});
	socket.on("disconnect", () => {
		console.log("User disconnected");
	});
};
module.exports = roomHandler;
