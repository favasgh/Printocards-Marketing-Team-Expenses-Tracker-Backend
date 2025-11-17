const validateRequest =
  (schema, property = 'body') =>
  (req, res, next) => {
    let dataToValidate = req[property];

    // Clean empty strings from query parameters before validation
    if (property === 'query') {
      dataToValidate = Object.entries(req[property]).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});
    }

    const { error, value } = schema.validate(dataToValidate, { abortEarly: false, stripUnknown: true });

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return res.status(400).json({ message: 'Validation failed', errors: messages });
    }

    // For query parameters, store cleaned values in a new property
    // Controllers should use req.validatedQuery instead of req.query
    if (property === 'query') {
      req.validatedQuery = value;
    } else {
      req[property] = value;
    }
    
    return next();
  };

export default validateRequest;

