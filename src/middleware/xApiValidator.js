const dotenv = require("dotenv");
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

function authenticateUser(req) {
	try {
		const apiKey = req.header("x-api-key");
		const timestamp = new Date().toISOString();
		const token = req.header("Authorization");

		if (!apiKey || apiKey !== process.env.xApiKey) {
			throw new Error("Invalid X-API-KEY");
		}

		if (!token) {
			throw new Error("Missing Authorization header");
		}

		const jwt_token = token.split(" ")[1];

		if (!jwt_token) {
			throw new Error("Invalid JWT token format");
		}

		const user = jwt.verify(jwt_token, process.env.jwt_secret);
		req.user = user;
	} catch (error) {
		console.error(error);

		if (error.name === "TokenExpiredError") {
			throw new Error("JWT token has expired");
		}

		throw new Error("Invalid JWT token");
	}
}

const xApiKeyValidator = async (req, res, next) => {
	const apiKey = req.header("x-api-key");

	if (!apiKey || apiKey != process.env.X_API_KEY) {
		return res.status(401).json({ message: "Invalid x-api-key" });
	}
	next();
	//   console.log("Authenticate middleware");
};

module.exports = { xApiKeyValidator, authenticateUser };
