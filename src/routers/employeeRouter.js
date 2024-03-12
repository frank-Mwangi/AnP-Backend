import { Router } from "express";

import {
  deleteEmployee,
  getEmployees,
  getEmployeesById,
  loginEmployee,
  registerEmployee,
  updateEmployee,
} from "../controllers/employeeController.js";

const employeeRouter = Router();

employeeRouter.get("/employees", getEmployees);
employeeRouter.get("/employee/:id", getEmployeesById);
employeeRouter.post("/employee", registerEmployee);
employeeRouter.post("/employees/auth/login", loginEmployee);
employeeRouter.put("/employees/:id", updateEmployee);
employeeRouter.delete("/employees/:id", deleteEmployee);
// userRouter.post("/user/register", registerUser);
// userRouter.post("/users/auth/login", loginUser);
// userRouter.get("/user", authMiddleware, getUsers);
// // userRouter.post("/users", createUser);

export default employeeRouter;
