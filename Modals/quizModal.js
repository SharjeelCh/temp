const mongoose = require("mongoose");

const quizScehema = mongoose.Schema(
 {
  user_id: {
   type: mongoose.Schema.Types.ObjectId,
   required: true,
   ref: "User",
  },
  totalScore: {
   type: Number,
   required: false,
  },
  quizInfo: [
   {
    type: {
     type: String,
     required: true,
    },
    quizType: {
     type: String,
     required: true,
    },
    difficulty: {
     type: String,
     required: true,
    },
    totalQuestions: {
     type: Number,
     required: true,
    },
    correct_answers: {
     type: Number,
     required: true,
    },
    score: {
     type: Number,
     required: true,
    },
   },
  ],
  
 },

 {
  timestamps: true,
 }
);

module.exports = mongoose.model("QuizData", quizScehema);
