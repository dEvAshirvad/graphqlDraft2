const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

// Define the Enquiry Schema
const userSchema = new mongoose.Schema(
	{},
	{ strict: false, collection: process.env.db_users }
);

// Create the Enquiry model
const userModal = mongoose.model(process.env.db_users, userSchema);

module.exports = userModal;
