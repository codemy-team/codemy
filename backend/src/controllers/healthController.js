// Health check endpoint
export const getHealth = (req, res) => {
    res.json({ status: "ok" });
};
