<<<<<<< HEAD
import express from "express";
import cors from "cors";
import { PORT } from "./config/env.js";
import { connectDB } from "./config/db.js";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import dataRoutes from "./routes/dataRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import reelRoutes from "./routes/reelRoutes.js";
import streakRoutes from "./routes/streakRoutes.js";

const app = express();

// Middleware
app.use(cors({
    origin: true,
    credentials: true,
}));
app.use(express.json());

// Serve static files (videos, images) from /public folder
app.use('/public', express.static('public'));

// Connect to database
await connectDB();
//hello there


// Routes
app.use("/auth", authRoutes);
app.use("/data", dataRoutes);
app.use("/admin", adminRoutes);
app.use("/reels", reelRoutes);
app.use("/streak", streakRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
=======
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());

const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error(err));

app.use("/auth", require("./routes/loginRoute"));
app.use("/data", require("./routes/dataRoute"));
app.use("/admin", require("./routes/adminRoute"));
app.use("/reels", require("./routes/reelRoutes"));
app.use("/upload", require("./routes/uploadRoute"));
app.use("/uploads", express.static("uploads"));

app.listen(process.env.PORT, () => {
    console.log("Server running on http://localhost:" + process.env.PORT);
>>>>>>> 1cff64e50888257e26bc72353e55aa900e4f0757
});
