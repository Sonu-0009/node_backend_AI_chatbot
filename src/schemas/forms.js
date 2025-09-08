import Joi from 'joi';

export const questionSchema = Joi.object({
  id: Joi.string().optional(),
  type: Joi.string().valid('text','radio','checkbox').required(),
  label: Joi.string().required(),
  required: Joi.boolean().optional(),
  placeholder: Joi.string().allow('').optional(),
  options: Joi.array().items(Joi.string()).default([]),
  validation: Joi.object().unknown(true).default({}),
});

export const formCreateSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow('').optional(),
  fields: Joi.array().items(questionSchema).min(1).required(),
});


