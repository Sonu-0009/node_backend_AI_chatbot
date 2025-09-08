"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const celebrate_1 = require("celebrate");
const router = (0, express_1.Router)();
router.post('/register', (0, celebrate_1.celebrate)({
    [celebrate_1.Segments.BODY]: celebrate_1.Joi.object({
        name: celebrate_1.Joi.string().min(2).required(),
        email: celebrate_1.Joi.string().email().required(),
        password: celebrate_1.Joi.string().min(6).required(),
    }),
}), auth_controller_1.register);
router.post('/login', (0, celebrate_1.celebrate)({
    [celebrate_1.Segments.BODY]: celebrate_1.Joi.object({
        email: celebrate_1.Joi.string().email().required(),
        password: celebrate_1.Joi.string().required(),
    }),
}), auth_controller_1.login);
exports.default = router;
