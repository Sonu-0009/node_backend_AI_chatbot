"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const celebrate_1 = require("celebrate");
const logger_1 = require("./utils/logger");
const error_1 = require("./middleware/error");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const protected_routes_1 = __importDefault(require("./routes/protected.routes"));
const forms_routes_1 = __importDefault(require("./routes/forms.routes"));
const formResponses_routes_1 = __importDefault(require("./routes/formResponses.routes"));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    app.use(logger_1.requestLogger);
    app.use('/api/auth', auth_routes_1.default);
    app.use('/api/protected', protected_routes_1.default);
    app.use('/api/forms', forms_routes_1.default);
    app.use('/api/forms/:formId/responses', formResponses_routes_1.default);
    app.use('/api/chat', chat_routes_1.default);
    app.use(error_1.notFoundHandler);
    app.use((0, celebrate_1.errors)());
    app.use(error_1.errorHandler);
    return app;
}
