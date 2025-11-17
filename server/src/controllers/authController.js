import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { generateToken } from '../utils/token.js';

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
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

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const isMatch = await user.comparePassword(password);
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

  console.log('Login successful for user:', {
    id: safeUser.id,
    email: safeUser.email,
    role: safeUser.role,
  });

  return res.json({ token, user: safeUser });
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }
  return res.json({ user });
});

