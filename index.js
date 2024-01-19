const express = require("express");
const cors = require("cors");
const { expressMiddleware } = require("@apollo/server/express4");
const createGraphqlServer = require("./src/graphql");
const { default: mongoose } = require("mongoose");
const http = require("http");
const AuthService = require("./src/comps/auth/auth.service");
const socketIo = require("socket.io");
const roomHandler = require("./src/socketHandler/room");
require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });

const authService = new AuthService();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 8080;
const SOCKETPORT = process.env.SOCKETPORT || 3080;

async function init() {
	mongoose
		.connect(process.env.DB_URL)
		.then(() => {
			app.listen(PORT, () => {
				console.log(`Server is litening at http://localhost:${PORT}`);
			});
			console.log("DB Connected");
		})
		.catch((error) => {
			console.log(error.message);
		});

	server.listen(SOCKETPORT, () => {
		console.log(`Websocket is litening at http://localhost:${SOCKETPORT}`);
	});

	const onConnection = (socket) => {
		roomHandler(io, socket);
		// console.log("A user connected", socket.id);
		// socket.on("join-room", () => {
		// 	console.log("creating room");
		// });
	};

	io.on("connection", onConnection);

	app.use(
		"/api/v1",
		expressMiddleware(await createGraphqlServer(), {
			context: async ({ req }) => {
				const apiKey = req.header("x-api-key");
				const timestamp = new Date().toISOString();
				const token = req.header("Authorization");

				if (!apiKey || apiKey !== process.env.xApiKey) {
					throw new Error("Invalid X-API-KEY");
				}

				if (!token) {
					return {};
				}

				const jwt_token = token.split(" ")[1];

				if (!jwt_token) {
					throw new Error("Invalid JWT token format");
				}

				// console.log(token);
				try {
					const user = authService.decodeJWTToken(jwt_token);
					// console.log(user);
					return { user };
				} catch (error) {
					return {};
				}
			},
		})
	);
}

init();
