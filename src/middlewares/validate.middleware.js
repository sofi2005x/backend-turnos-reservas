// Middleware genérico: recibe un schema de Zod y valida el body o los params
// antes de que la petición llegue al controller. Si algo falla, corta acá
// mismo con 400 -> nunca llega a tocar la base de datos.

export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const message = result.error.errors.map((e) => e.message).join(', ');
    return res.status(400).json({ status: 'error', message });
  }

  req.body = result.data; // body ya limpio, sin campos extra no declarados en el schema
  next();
};

export const validateParams = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.params);

  if (!result.success) {
    const message = result.error.errors.map((e) => e.message).join(', ');
    return res.status(400).json({ status: 'error', message });
  }

  next();
};