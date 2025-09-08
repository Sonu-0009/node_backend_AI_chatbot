"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const celebrate_1 = require("celebrate");
const formResponses_controller_1 = require("../controllers/formResponses.controller");
const router = (0, express_1.Router)({ mergeParams: true });
router.post('/', (0, celebrate_1.celebrate)({ [celebrate_1.Segments.BODY]: celebrate_1.Joi.object().unknown(true) }), formResponses_controller_1.submitResponse);
router.get('/', formResponses_controller_1.listResponses);
exports.default = router;
