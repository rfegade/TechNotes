// Import data models
const User = require("../models/User");
const Note = require("../models/Note");
// import Async handler - it keep us for using try catch block
const asyncHandler = require("express-async-handler");
// import bcrypt -  to hash the password before we save it
const bcrypt = require("bcrypt");

// Create controller functions - follow the below patter to create controller functions

// @desc - Get all users
// @route - GET /users
// @access - Private

const getAllUsers = asyncHandler(async (req, res) => {
  // .select('-password) will remove passwords form response (better security)
  // .lean() will returen leaner json object by avoiding unneccesory methods in response
  const users = await User.find().select("-password").lean();

  if (!users?.length) {
    return res.status(400).json({ message: "No users found" });
  }

  res.json(users);
});

// @desc - Create a user
// @route - POST /users
// @access - Private

const createNewUser = asyncHandler(async (req, res) => {
  // destructure incoming fileds
  const { username, password, roles } = req.body;

  // confirm data
  if (!username || !password || !Array.isArray(roles) || !roles.length) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // find duplicates
  // .exec() - if you are using async await and want to recieve a promise back, you need to use exec (acc to documention)
  const duplicate = await User.findOne({ username }).lean().exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  // Hash password
  const hashedPwd = await bcrypt.hash(password, 10); // salt rounds

  // define user object before we save it
  const userObject = { username, password: hashedPwd, roles };

  // create and store new user

  const user = await User.create(userObject);

  if (user) {
    res.status(201).json({ message: `New user ${username} is created` });
  } else {
    res.status(400).json({ message: "Invalid used data received" });
  }
});

// @desc - Update a user
// @route - PATCH /users
// @access - Private

const updateUser = asyncHandler(async (req, res) => {
  // destructure the inconing data
  const { id, username, roles, active, password } = req.body;

  // confirm data
  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // find user by id

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // check for duplicates
  const duplicate = await User.findOne({ username }).lean().exec();

  // Allow updated to the original user
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  user.username = username;
  user.roles = roles;
  user.active = active;

  if (password) {
    // hash password
    user.password = await bcrypt.hash(password, 10); // salt rounds
  }

  const updatedUser = await user.save();

  res.json({ message: `${updatedUser.username} updated` });
});

// @desc - Delete a user
// @route - DELETE /users
// @access - Private

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    res.status(400).json({ message: "User id is required" });
  }

  // find out if user is assigned to any notes
  const note = await Note.findOne({ user: id }).lean().exec();
  if (note) {
    res.status(400).json({ message: "User has assigned notes" });
  }

  // find user
  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const result = await user.deleteOne();

  const reply = `Username ${result.username} with ID ${result._id} deleted`;

  res.json(reply);
});

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
};
