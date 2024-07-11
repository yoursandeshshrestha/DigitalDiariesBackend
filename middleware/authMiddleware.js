const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  const auth = req.headers.authorization;

  if (auth && auth.startsWith("Bearer ")) {
    const token = auth.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Unauthorized: invalid token" });
      }
      req.user = user;
      console.log(req.user);
      next();
    });
  } else {
    return res.status(401).json({ message: "Unauthorized: no token provided" });
  }
};

module.exports = authMiddleware;
