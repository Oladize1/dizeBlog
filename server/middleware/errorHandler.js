export const errorHandler = async (err, req, res, next) => {
  console.error("Backend Error Logged:", err.message);

  
  const statusCode = err.statusCode || err.status || 500;

  
  return res.status(statusCode).json({
    message: err.message || "Internal Server Error",
  });
};
