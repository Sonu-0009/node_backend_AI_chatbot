"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createForm = createForm;
exports.listForms = listForms;
exports.getForm = getForm;
exports.updateForm = updateForm;
exports.deleteForm = deleteForm;
const Form_1 = require("../models/Form");
async function createForm(req, res) {
    const ownerId = req.user.id;
    const form = await Form_1.Form.create({ ...req.body, ownerId });
    res.status(201).json(form);
}
async function listForms(req, res) {
    const ownerId = req.user.id;
    const forms = await Form_1.Form.find({ ownerId });
    res.json(forms);
}
async function getForm(req, res) {
    const form = await Form_1.Form.findById(req.params.id);
    if (!form)
        return res.status(404).json({ error: 'Form not found' });
    res.json(form);
}
async function updateForm(req, res) {
    const ownerId = req.user.id;
    const form = await Form_1.Form.findOneAndUpdate({ _id: req.params.id, ownerId }, req.body, { new: true });
    if (!form)
        return res.status(404).json({ error: 'Form not found' });
    res.json(form);
}
async function deleteForm(req, res) {
    const ownerId = req.user.id;
    const form = await Form_1.Form.findOneAndDelete({ _id: req.params.id, ownerId });
    if (!form)
        return res.status(404).json({ error: 'Form not found' });
    res.status(204).send();
}
