const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("./models/User");

const JWT_SECRET = "codelens_secret_key";

mongoose
    .connect("mongodb://127.0.0.1:27017/codelens")
    .then(() => {
        console.log("MongoDB Connected");
    })
    .catch((error) => {
        console.log("MongoDB Connection Error:", error);
    });

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("CodeLens Backend is running!");
});
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];

    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Access token required"
        });
    }

    jwt.verify(token, JWT_SECRET, (error, user) => {

        if (error) {
            return res.status(403).json({
                message: "Invalid or expired token"
            });
        }

        req.user = user;

        next();
    });
}




app.get("/api/users", async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to fetch users"
        });
    }
});
app.get("/api/profile", authenticateToken, async (req, res) => {

    try {

        const user = await User.findById(req.user.userId)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            message: "Protected API accessed successfully",
            user: user
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

app.post("/api/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please fill all fields"
            });
        }

        const existingUser = await User.findOne({
            email: email
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Account already exists with this email"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name: name,
            email: email,
            password: hashedPassword
        });

        await user.save();

        res.status(201).json({
            message: "Signup successful",
            user: {
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.log("SIGNUP ERROR:", error);

        res.status(500).json({
            message: "Signup failed"
        });
    }
});

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({
            email: email
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email
            },
            JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        console.log("JWT TOKEN:", token);

        res.json({
            message: "Login successful",
            token: token,
            user: {
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.log("LOGIN ERROR:", error);

        res.status(500).json({
            message: "Login failed"
        });
    }
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});