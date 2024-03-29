import jwt from "jsonwebtoken";
import { notAuthorized } from "../helpers/helperFunctions";

export const authMiddleware = (req, res, next) => {
  if (
    req.headers &&
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "JWT"
  ) {
    jwt.verify(
      req.headers.authorization.split(" ")[1],
      process.env.JWT_SECRET,
      (err, decode) => {
        if (err) {
          return notAuthorized(res, "Unauthorized employee");
        } else {
          req.employee = decode;
          next();
        }
      }
    );
  } else {
    return notAuthorized(res, "Unauthorized employee");
  }
};
