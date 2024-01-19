const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

// Define the Enquiry Schema
const assessmentSchema = new mongoose.Schema(
	{},
	{ strict: false, collection: process.env.db_mcq }
);
const roomSchema = new mongoose.Schema(
	{},
	{ strict: false, collection: process.env.db_rooms }
);

// Create the Enquiry model
const assessmentModal = mongoose.model(process.env.db_mcq, assessmentSchema);
const roomModal = mongoose.model(process.env.db_rooms, roomSchema);

module.exports = { assessmentModal, roomModal };
