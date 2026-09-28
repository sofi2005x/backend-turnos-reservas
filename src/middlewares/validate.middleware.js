// Middlewares genericos de validacion con Zod.
// Si algo falla, cortan con 400 y la peticion nunca llega al controller.

const formatIssues = (error) =>
  error.issues
    .map((i) => (i.path.length ? `${i.path.join('.')}: ${i.message}` : i.message))
    .join(', ');

export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ status: 'error', message: formatIssues(result.error) });
  }

  req.body = result.data; // body limpio, sin campos extra no declarados en el schema
  next();
};

export const validateParams = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.params);

  if (!result.success) {
    return res.status(400).json({ status: 'error', message: formatIssues(result.error) });
  }

  next();
};

// En Express 5 req.query es de solo lectura: no se puede reasignar.
// Guardamos los valores ya validados y convertidos en req.validatedQuery.
export const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);

  if (!result.success) {
    return res.status(400).json({ status: 'error', message: formatIssues(result.error) });
  }

  req.validatedQuery = result.data;
  next();
};