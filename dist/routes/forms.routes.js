"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const celebrate_1 = require("celebrate");
const auth_1 = require("../middleware/auth");
const forms_controller_1 = require("../controllers/forms.controller");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.post('/', (0, celebrate_1.celebrate)({
    [celebrate_1.Segments.BODY]: celebrate_1.Joi.object({
        title: celebrate_1.Joi.string().required(),
        description: celebrate_1.Joi.string().allow(''),
        fields: celebrate_1.Joi.array().items(celebrate_1.Joi.object({
            name: celebrate_1.Joi.string().required(),
            type: celebrate_1.Joi.string().required(),
            required: celebrate_1.Joi.boolean().default(false),
        })).default([]),
    })
}), forms_controller_1.createForm);
router.get('/', forms_controller_1.listForms);
router.get('/:id', forms_controller_1.getForm);
router.put('/:id', forms_controller_1.updateForm);
router.delete('/:id', forms_controller_1.deleteForm);
exports.default = router;
