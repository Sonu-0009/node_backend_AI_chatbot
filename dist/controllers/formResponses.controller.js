"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitResponse = submitResponse;
exports.listResponses = listResponses;
const FormResponse_1 = require("../models/FormResponse");
async function submitResponse(req, res) {
    const response = await FormResponse_1.FormResponse.create({ formId: req.params.formId, data: req.body });
    res.status(201).json(response);
}
async function listResponses(req, res) {
    const responses = await FormResponse_1.FormResponse.find({ formId: req.params.formId });
    res.json(responses);
}
