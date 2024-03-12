import express from "express";
import logger from "./src/utils/logger.js";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import employeeRouter from "./src/routers/employeeRouter.js";
import cors from "cors";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
var corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

//middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors(corsOptions));

app.get("/health", (req, res) => {
  res.status(200).send("I am very healthy");
});

app.use("/api", employeeRouter);

app.listen(port, () => {
  logger.info(`Server running on port http://localhost:${port}`);
});
