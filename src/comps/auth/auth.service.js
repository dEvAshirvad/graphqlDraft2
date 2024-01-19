const jwt = require("jsonwebtoken");
const userModal = require("./auth.modal");
require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });
const bcrypt = require("bcrypt");

class AuthService {
	async generateHash(password) {
		const saltRounds = 10;
		try {
			const hash = await bcrypt.hash(password, saltRounds);
			return hash;
		} catch (error) {
			// console.log(error.message);
			throw new Error("Error generating hash");
		}
	}
	decodeJWTToken(token) {
		// console.log(token, process.env.jwt_secret);
		return jwt.verify(token, process.env.jwt_secret);
	}
	async verifyPassword(password, hashedPassword) {
		try {
			const match = await bcrypt.compare(password, hashedPassword);
			return match;
		} catch (error) {
			throw new Error("Error verifying password");
		}
	}
	generateToken({ name, email, username }, expiresIn = "8h") {
		try {
			const token = jwt.sign(
				{ name, email, username },
				process.env.jwt_secret
				// { expiresIn }
			);
			return token;
		} catch (error) {
			throw new Error("error while genrating token");
		}
	}
	async createUser({ name, email, password, username }) {
		// Check if the email is already registered
		if (!name || !email || !password || !username) {
			throw new Error("All fields are required");
		}
		const existingUser = await userModal.findOne({ email });
		if (existingUser) {
			throw new Error("Email is already registered");
		}

		// Hash the password
		const hashedPassword = await this.generateHash(password);

		// Save the user to the database
		try {
			const token = this.generateToken({ name, email, username });
			const newUser = new userModal({
				name,
				email,
				password: hashedPassword,
				username,
				accessToken: token,
				createdAt: new Date().toISOString(),
			});
			await newUser.save();
			return token;
		} catch (error) {
			throw new Error("Error creating user");
		}
	}
	async loginUser(email, password) {
		// Find the user by email
		const user = await userModal.findOne({ email });
		if (!user) {
			throw new Error("User not found");
		}

		// Verify the password
		const isPasswordValid = await this.verifyPassword(password, user.password);
		if (!isPasswordValid) {
			throw new Error("Invalid password");
		}

		// Generate a JWT token using the generateToken method
		const token = this.generateToken({
			email,
			username: user.username,
			name: user.name,
		});

		await userModal.findOneAndUpdate(
			{ email },
			{ accessToken: token, updatedAt: new Date().toISOString() },
			{ new: true }
		);

		return token;
	}
}

module.exports = AuthService;
