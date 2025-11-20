import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { generateToken } from '../utils/token.js';

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Use lean and select only email for existence check
  const existingUser = await User.findOne({ email }).select('_id').lean();
  if (existingUser) {
    return res.status(409).json({ message: 'Email already exists.' });
  }

  const user = await User.create({ name, email, password });

  const token = generateToken({ id: user._id, role: user.role });
  const safeUser = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  return res.status(201).json({ token, user: safeUser });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Normalize email to lowercase and trim (matching schema behavior)
  const normalizedEmail = email?.toLowerCase().trim();

  if (!normalizedEmail || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  // Select only needed fields for faster query
  const user = await User.findOne({ email: normalizedEmail }).select('name email role password').lean();
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  // Compare password using bcrypt directly since we have lean document
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const token = generateToken({ id: user._id, role: user.role });

  const safeUser = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  return res.json({ token, user: safeUser });
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }
  return res.json({ user });
});

