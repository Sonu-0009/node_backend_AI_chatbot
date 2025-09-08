"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postGuestMessage = postGuestMessage;
exports.listGuestMessages = listGuestMessages;
exports.postUserMessage = postUserMessage;
exports.listUserMessages = listUserMessages;
const GuestChat_1 = require("../models/GuestChat");
const UserChat_1 = require("../models/UserChat");
async function postGuestMessage(req, res) {
    const msg = await GuestChat_1.GuestChat.create({ name: req.body.name, message: req.body.message });
    res.status(201).json(msg);
}
async function listGuestMessages(req, res) {
    const msgs = await GuestChat_1.GuestChat.find().sort({ createdAt: -1 });
    res.json(msgs);
}
async function postUserMessage(req, res) {
    const msg = await UserChat_1.UserChat.create({ userId: req.user.id, message: req.body.message });
    res.status(201).json(msg);
}
async function listUserMessages(req, res) {
    const msgs = await UserChat_1.UserChat.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(msgs);
}
