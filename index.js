import express from "express";
import logger from "./src/utils/logger.js";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import employeeRouter from "./src/routers/employeeRouter.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

//middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.status(200).send("I am very healthy");
});

app.use("/api", employeeRouter);

app.listen(port, () => {
  logger.info(`Server running on port http://localhost:${port}`);
});
