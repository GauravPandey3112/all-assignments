const jwt = require("jsonwebtoken");
const fs = require("fs");

export const generateToken = (data) => {
  const token = jwt.sign(data, process.env.JWT_SECRET_KEY, {
    expiresIn: "1h",
  });
  return token;
};

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(403).json({
        error: "Please provide an authentication header!",
      });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(403).json({
        error: "Please provide a token!",
      });
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.username = payload.username;
    next();
  } catch (e) {
    res.status(401).send("Please authenticate");
  }
};

export const readJsonFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    throw error;
  }
};

export const writeJSONFile = (filePath, data) => {
  try {
    const json = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, json, "utf8");
  } catch (error) {
    throw error;
  }
};
