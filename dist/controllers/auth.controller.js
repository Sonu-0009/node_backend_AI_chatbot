"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const env_1 = require("../config/env");
async function register(req, res) {
    const { name, email, password } = req.body;
    const existing = await User_1.User.findOne({ email });
    if (existing)
        return res.status(400).json({ error: 'Email already registered' });
    const user = await User_1.User.create({ name, email, password });
    res.status(201).json({ id: user._id, name: user.name, email: user.email });
}
async function login(req, res) {
    const { email, password } = req.body;
    const user = await User_1.User.findOne({ email });
    if (!user)
        return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await user.comparePassword(password);
    if (!ok)
        return res.status(401).json({ error: 'Invalid credentials' });
    const token = jsonwebtoken_1.default.sign({ id: user._id }, env_1.config.jwtSecret, { expiresIn: '7d' });
    res.json({ token });
}
