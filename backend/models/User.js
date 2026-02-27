const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        age: {
            type: Number,
            required: [true, "Age is required"],
            min: 1,
        },
        familyEmail: {
            type: String,
            required: [true, "Family email is required"],
            trim: true,
            lowercase: true,
        },
        baseline: {
            typingSpeed: { type: Number, default: 0 },
            responseTime: { type: Number, default: 0 },
            vocabScore: { type: Number, default: 0 },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
