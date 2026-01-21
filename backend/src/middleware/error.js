export const notFound = (req, res) => {
    res.status(404).json({ error: { message: "Not Found" } });
};

export const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    const status = err.status || 500;
    const message = err.message || "Internal Server Error";
    return res.status(status).json({ error: { message } });
};
