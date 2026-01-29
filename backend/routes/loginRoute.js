const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");

const SALT_ROUNDS = 10;

// POST /auth/register - Create a new user
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validate required fields
        if (!username || !email || !password) {
            return res.status(400).json({ error: "Username, email, and password are required" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(409).json({ error: "User with this email or username already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Create new user
        const user = new User({
            username,
            email,
            password: hashedPassword
        });

        await user.save();

        // Store user ID in session
        req.session.userId = user._id;

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// POST /auth/login - Authenticate user
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Store user ID in session
        req.session.userId = user._id;

        res.json({
            message: "Login successful",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// POST /auth/logout - End session
router.post("/logout", (req, res) => {
    // Check if user is logged in
    if (!req.session.userId) {
        return res.status(401).json({ error: "You are not logged in" });
    }

    req.session.destroy((err) => {
        if (err) {
            console.error("Logout error:", err);
            return res.status(500).json({ error: "Failed to logout" });
        }
        res.clearCookie("connect.sid");
        res.json({ message: "Logout successful" });
    });
});

// DELETE /auth/delete-account - Delete user account
router.delete("/delete-account", async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.session.userId) {
            return res.status(401).json({ error: "You must be logged in to delete your account" });
        }

        const userId = req.session.userId;

        // Delete user from database
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        // Destroy session
        req.session.destroy((err) => {
            if (err) {
                console.error("Session destroy error:", err);
            }
            res.clearCookie("connect.sid");
            res.json({ message: "Account deleted successfully" });
        });
    } catch (error) {
        console.error("Delete account error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
