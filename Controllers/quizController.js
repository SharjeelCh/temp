const expressAsyncHandler = require("express-async-handler");
const QuizData = require("../Modals/quizModal");
const userModal = require("../Modals/userModal");
const quizModal = require("../Modals/quizModal");

const createUserQuizData = expressAsyncHandler(async (req, res) => {
 const { type, quizType, difficulty, totalQuestions, correct_answers, score } =
  req.body;

 if (
  !type ||
  !quizType ||
  !difficulty ||
  !totalQuestions ||
  !correct_answers ||
  !score
 ) {
  res.status(400);
  throw new Error("All fields are required");
 }
 const checkQuizData = await QuizData.findOne({ user_id: req.params.id });
 if (checkQuizData) {
  checkQuizData.totalScore += score;
  checkQuizData.quizInfo.push({
   type,
   quizType,
   difficulty,
   totalQuestions,
   correct_answers,
   score,
  });
  await checkQuizData.save();
  res.status(201).json({ message: "Quiz Data Updated" });
 } else {
  const newQuizData = new QuizData({
   user_id: req.params.id,
   totalScore: score,
   quizInfo: [
    {
     type,
     quizType,
     difficulty,
     totalQuestions,
     correct_answers,
     score,
    },
   ],
  });
  await newQuizData.save();
  res.status(201).json({ message: "Quiz Data Created" });
 }
});

const getQuizData = expressAsyncHandler(async (req, res) => {
 const quizData = await QuizData.find({ user_id: req.params.id });
 if (!quizData) {
  res.status(404);
  throw new Error("Quiz Data not found");
 }
 res.json(quizData);
});

const getQuizDataByCat = expressAsyncHandler(async (req, res) => {
 const user_id = req.params.id;
 const quizType = req.query.quizType;
 const quizData = await QuizData.findOne({
  user_id: user_id,
 });
 if (!quizData) {
  res.status(404);
  throw new Error("Quiz Data not found");
 }

 const quizInfo = quizData.quizInfo.filter(
  (item) => item.quizType === quizType
 );

 res.json(quizInfo);
});

const getPlayersNumber = expressAsyncHandler(async (req, res) => {
 const numOfPlayers = await userModal.find().countDocuments();
 res.json(numOfPlayers);
});

const rankPlayers = expressAsyncHandler(async (req, res) => {
 try {
  const players = await quizModal.find().sort({ totalScore: -1 });

  const users = await userModal.find();

  const userMap = users.reduce((map, user) => {
   map[user._id] = user.username;
   return map;
  }, {});

  const playersData = players.map((player, index) => ({
   totalScore: player.totalScore,
   rank: index + 1,
   username: userMap[player.user_id],
  }));

  res.json(playersData);
 } catch (error) {
  res.status(500).json({ message: error.message });
 }
});

module.exports = {
 createUserQuizData,
 getQuizData,
 getQuizDataByCat,
 getPlayersNumber,
 rankPlayers,
};
