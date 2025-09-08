export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const data = req[source] || {};
    const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({ detail: 'Validation error', errors: error.details.map(d => ({ message: d.message, path: d.path })) });
    }
    req[source] = value;
    next();
  };
}


