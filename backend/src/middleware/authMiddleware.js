const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ message: "Avtorizaciyadan ótpegen" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Token ichidagi user ma'lumotlarini req'ga qo'shamiz
        next();
    } catch (err) {
        res.status(401).json({ message: "Token jaramsız" });
    }
};

module.exports = authMiddleware;