import Joi from 'joi';

export const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(4).required(),
  mobile: Joi.string().required(),
  gender: Joi.string().valid('M','F','O').required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const createAdminSchema = signupSchema; // same fields


