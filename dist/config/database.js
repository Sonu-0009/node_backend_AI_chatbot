"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = connectDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
async function connectDatabase() {
    mongoose_1.default.set('strictQuery', true);
    await mongoose_1.default.connect(env_1.config.mongoUri);
}
