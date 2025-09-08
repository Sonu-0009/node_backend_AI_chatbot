import Joi from 'joi';

export const responseSubmitSchema = Joi.object({
  form_id: Joi.string().required(),
  answers: Joi.alternatives().try(
    Joi.object().unknown(true),
    Joi.array().items(Joi.object({ id: Joi.string().required(), answer: Joi.any() }))
  ).required(),
  category: Joi.string().optional(),
  title: Joi.string().optional(),
  submitted_at: Joi.date().optional(),
});


