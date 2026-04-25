module.exports = (err, req, res, next) => {
  const isSequelizeValidation = err.name === "SequelizeValidationError";
  const isSequelizeUnique = err.name === "SequelizeUniqueConstraintError";

  const status =
    err.status ||
    err.statusCode ||
    (err.type === "entity.too.large" ? 413 : 0) ||
    (err instanceof SyntaxError ? 400 : 0) ||
    (isSequelizeValidation || isSequelizeUnique ? 400 : 0) ||
    500;

  let message =
    err.type === "entity.too.large"
      ? "Payload demasiado grande"
      : err instanceof SyntaxError
        ? "JSON invalido"
        : isSequelizeUnique
          ? "El recurso ya existe (duplicado)"
          : err.message || "Error interno";

  if (isSequelizeValidation && Array.isArray(err.errors) && err.errors.length) {
    const field = err.errors[0].path || err.errors[0].validatorKey || "campo";
    message = `Dato invalido en '${field}': ${err.errors[0].message}`;
  }

  const payload = {
    ok: false,
    msg: message,
    requestId: req.requestId || null
  };

  if (isSequelizeValidation && Array.isArray(err.errors)) {
    payload.validationErrors = err.errors.map((e) => ({
      field: e.path,
      msg: e.message
    }));
  }

  res.status(status).json(payload);
};

