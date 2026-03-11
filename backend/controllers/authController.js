import asyncHandler from "express-async-handler";
import User from "../models/User.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please fill all fields");
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error("Email already registered");
  }

  // First user = admin, everyone else = employee
  const userCount = await User.countDocuments();

  const user = await User.create({
    name,
    email,
    password,
    role: userCount === 0 ? "admin" : "employee",
  });

  res.status(201).json({
    token: user.generateToken(),
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Please fill all fields");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }
  if (!user.isActive) {
    res.status(401);
    throw new Error("Account deactivated");
  }

  res.json({
    token: user.generateToken(),
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
});

export const logout = asyncHandler(async (req, res) => {
  res.json({ message: "Logged out" });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { name, phone, location, bio } = req.body;
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (location) user.location = location;
  if (bio) user.bio = bio;
  await user.save();
  res.json({ user });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  res.json({ message: "If that email exists, a reset link has been sent." });
});

export const resetPassword = asyncHandler(async (req, res) => {
  res.json({ message: "Password reset successful" });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.matchPassword(currentPassword))) {
    res.status(400);
    throw new Error("Current password incorrect");
  }
  user.password = newPassword;
  await user.save();
  res.json({ token: user.generateToken(), message: "Password changed" });
});