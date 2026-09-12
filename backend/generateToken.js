import "dotenv/config";
import jwt from "jsonwebtoken";

const token = jwt.sign(
  {
    id: 1,
    email: "testuser@example.com",
  },
  process.env.JWT_SECRET,
  {
    expiresIn: "1h",
  }
);

console.log("JWT Token:");
console.log(token);