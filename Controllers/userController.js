const asyncHandler = require("express-async-handler");
const nodeMalier = require("nodemailer");
require("dotenv").config("../.env");
const crypto = require("crypto");
const User = require("../Modals/userModal");

const transporter = nodeMalier.createTransport({
 host: "smtp.gmail.com",
 port: 587,
 secure: false,
 auth: {
  user: process.env.USER_EMAIL,
  pass: process.env.USER_PASSWORD,
 },
});

const sendToken = asyncHandler(async (req, res) => {
 const token = crypto.randomBytes(20).toString("hex");
 const email = req.body.email;

 await User.updateOne(
  { email },
  { verificationToken: token, isVerified: false }
 );

 var info = {
  from: process.env.USER_EMAIL,
  to: email,
  subject: "Verification Token",
  html: ` <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
            <div style="background-color: #007BFF; padding: 20px; text-align: center;">
                <h1 style="color: #fff; margin: 0;">Welcome to Quizmo!</h1>
            </div>
            <div style="padding: 20px; background-color: #f9f9f9;">
                <h2 style="color: #333;">Verify Your Account</h2>
                <p style="color: #555; font-size: 16px; line-height: 1.6;">
                    Thank you for signing up, Please verify your account by clicking the button below:
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://quizmo-six.vercel.app/api/users/verify/${token}" style="background-color: #28A745; color: #fff; padding: 15px 25px; text-decoration: none; font-size: 18px; border-radius: 5px; display: inline-block;">
                        Verify Account
                    </a>
                </div>
                <p style="color: #555; font-size: 14px; line-height: 1.6;">
                    Or you can copy and paste the following link into your browser:
                </p>
                <p style="color: #007BFF; font-size: 14px; word-break: break-all;">
                    https://quizmo-six.vercel.app/api/users/verify/${token}
                </p>
            </div>
            <div style="background-color: #007BFF; padding: 10px; text-align: center;">
                <p style="color: #fff; margin: 0;">&copy; 2024 Quizmo</p>
            </div>
        </div>`,
 };

 transporter.sendMail(info, (err, data) => {
  if (err) {
   
   res.status(500).json({ message: "Error sending email" });
  } else {
   
   res.status(200).json({ message: "Verification email sent" });
  }
 });
});

const verifyToken = asyncHandler(async (req, res) => {
 const token = req.params.token;
 const user = await User.findOne({ verificationToken: token });

 if (user) {
  user.isVerified = true;
  user.verificationToken = undefined;

  await user.save();
  res.status(200).json({ message: "User verified" });
 } else {
  res.status(400).json({ message: "Invalid Token" });
 }
});

const Signup = asyncHandler(async (req, res) => {
 const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail.com$/;
 const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
 const { username, email, password } = req.body;

 if (!username || !email || !password) {
  res.status(400);
  throw new Error("All fields are required");
 }
 if (!gmailRegex.test(email)) {
  res.status(400).json({ message: "Invalid email" });
  throw new Error("Invalid email");
 }
 if (!passwordRegex.test(password)) {
  res
   .status(400)
   .json({
    message:
     "Password must contain at least 8 characters, including uppercase, lowercase letters and numbers",
   });
  throw new Error(
   "Password must contain at least 8 characters, including uppercase, lowercase letters and numbers"
  );
 }
 const checkAlreadyUser = await User.findOne({ email });
 if (checkAlreadyUser) {
  res.status(400).json({ message: "User already exists" });
  throw new Error("User already exists");
 }
 const newUser = new User({
  username,
  email,
  password,
  verificationToken: undefined,
  isVerified: false,
 });
 await newUser.save();
 await sendToken(req, res);
});

const Login = asyncHandler(async (req, res) => {
 const { email, password } = req.body;
 if (!email || !password) {
  res.status(400);
  throw new Error("All fields are required");
 }
 const checkUserinDB = await User.findOne({ email });
 const isVerified = checkUserinDB.isVerified;

 if (checkUserinDB) {
  if (isVerified) {
   if (checkUserinDB.password === password) {
    checkUserinDB.password = undefined;
    res.status(200).json({ message: "User logged in", data: checkUserinDB});
   } else {
    res.status(400).json({ message: "Invalid email or password" });
   }
  } else {
   res.status(400).json({ message: "User not verified" });
  }
 } else {
  res.status(400).json({ message: "User not found" });
 }
});

const resetPassword = asyncHandler(async (req, res) => {
 const { email } = req.body;
 if (!email) {
  res.status(400);
  throw new Error("Email is required");
 }
 const checkUserinDB = await User.findOne({ email });
 if (checkUserinDB) {
 }
});

const sendMessage = asyncHandler(async (req, res) => {
 const { email, username, message } = req.body;
 if (!email || !username || !message) {
  res.status(400);
  throw new Error("All fields are required");
 }
 var info = {
  from: email,
  to: process.env.USER_EMAIL,
  replyTo: email,
  subject: `Message from ${username}, dedicated player of Quizmo`,
  html: `
   <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
            <div style="background-color: #4CAF50; padding: 20px; text-align: center;">
                <h1 style="color: #fff; margin: 0;">You've Got a New Message!</h1>
            </div>
            <div style="padding: 20px; background-color: #f9f9f9;">
                <h2 style="color: #333;">Hello, you have a message from ${username}</h2>
                <p style="color: #555; font-size: 16px; line-height: 1.6;">
                    ${message}
                </p>
                <p style="color: #888; font-size: 14px; text-align: right;">
                    <em>Sender's Email: <a href="mailto:${email}" style="color: #4CAF50;">${email}</a></em>
                </p>
            </div>
            <div style="background-color: #4CAF50; padding: 10px; text-align: center;">
                <p style="color: #fff; margin: 0;">&copy; 2024 Quizmo</p>
            </div>
        </div>
  `,
 };
 transporter.sendMail(info, (err, data) => {
  if (err) {
   
   res.status(500).json({ message: "Error sending email" });
  } else {
   
   res.status(200).json({ message: "Message sent" });
  }
 });
});

module.exports = { Signup, verifyToken, sendToken, Login, sendMessage };
