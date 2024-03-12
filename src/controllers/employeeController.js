import {
  checkIfValuesIsEmptyNullUndefined,
  notAuthorized,
  sendBadRequest,
  sendCreated,
  sendDeleteSuccess,
  sendNotFound,
  sendServerError,
} from "../helpers/helperFunctions.js";
import {
  createEmployeeService,
  deleteEmployeeService,
  findByCredentialsService,
  getEmployeeByEmailService,
  getEmployeesService,
  updateEmployeeService,
} from "../services/employeeService.js";
import {
  employeeLoginValidator,
  employeeValidator,
} from "../validators/employeeValidator.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import cron from "node-cron";
import dotenv from "dotenv";
import logger from "../utils/logger.js";

export const registerEmployee = async (req, res) => {
  const {
    FirstName,
    LastName,
    Address,
    DOB,
    Contact,
    Gender,
    Position,
    Schedule,
    PhotoURL,
    Email,
    Password,
  } = req.body;
  const Admin = 0;
  const { error } = employeeValidator({
    FirstName,
    LastName,
    Address,
    DOB,
    Contact,
    Gender,
    Position,
    Schedule,
    PhotoURL,
    Email,
    Password,
  });
  if (error) {
    return res.status(400).send(error.details[0].message);
  } else {
    const ourEmployee = await getEmployeeByEmailService(Email);

    console.log(ourEmployee.length);
    if (ourEmployee.length !== 0) {
      res.status(400).send("Employee already exists");
    } else {
      try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(Password, salt);
        console.log("hashedPassword:", typeof hashedPassword);
        const newEmployee = {
          FirstName,
          LastName,
          Address,
          DOB,
          Contact,
          Gender,
          Position,
          Schedule,
          PhotoURL,
          Email,
          hashedPassword,
          Admin,
        };
        const response = await createEmployeeService(newEmployee);
        if (response.message) {
          console.log("Error here");
          sendServerError(res, response.message);
        } else {
          sendMail(newEmployee.FirstName, newEmployee.Email, Password);
          sendCreated(res, "Employee created successfully");
        }
      } catch (error) {
        sendServerError(res, error.message);
      }
    }
  }
};

export const sendMail = async (firstName, email, password, req, res) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Welcome to A&P",
    html: `Hi, ${firstName}! We are thrilled to have you on board. Your Login details are as follows: Email: ${email}, Password: ${password}. Please navigate to your profile to update your password and any other personal details.`,
    //html: emailTemp,
  };
  try {
    logger.info("Sending mail...");
    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        logger.error(error);
        res.status(500).send(error);
      } else {
        logger.info(`Email sent: ${info.response}`);
        res.status(200).send(info.response);
      }
    });
  } catch (error) {
    logger.error(error);
  }
};

export const loginEmployee = async (req, res) => {
  const { Email, Password } = req.body;
  const { error } = employeeLoginValidator({ Email, Password });
  if (error) {
    return res.status(400).send(error.details[0].message);
  } else {
    try {
      const employeeResponse = await findByCredentialsService({
        Email,
        Password,
      });
      console.log("Employee Response", employeeResponse);
      if (employeeResponse.error) {
        notAuthorized(res, employeeResponse.error);
      } else {
        res.status(200).send(employeeResponse);
      }
    } catch (error) {
      sendServerError(res, error.message);
    }
  }
};

export const getEmployees = async (req, res) => {
  try {
    console.log("Attempt made");
    const data = await getEmployeesService();
    if (data.length == 0) {
      sendNotFound(res, "No employees found");
    } else {
      const employeesList = [];
      data.forEach((element) => {
        const { Password, ...employeeData } = element;
        employeesList.push(employeeData);
      });

      res.status(200).json(employeesList);
    }
  } catch (error) {
    console.log("Caught here");
    res.status(500).send("Server error");
  }
};

export const getEmployeesById = async (req, res) => {
  try {
    const data = await getEmployeesService();

    const employee = data.find((item) => item.EmployeeID == req.params.id);
    if (!employee) {
      sendNotFound(res, "Employee not found");
    } else {
      const { Password, ...employeeData } = employee;
      res.status(200).json(employeeData);
    }
  } catch {
    res.status(500).send("Server Error");
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const data = await getEmployeesService();
    const EmployeeID = req.params.id;
    const employee = data.find((item) => item.EmployeeID == EmployeeID);
    if (!employee) {
      sendNotFound(res, "Employee to update not found");
    } else {
      if (checkIfValuesIsEmptyNullUndefined(req, res, req.body)) {
        const {
          FirstName,
          LastName,
          Address,
          DOB,
          Contact,
          Gender,
          Position,
          Schedule,
          PhotoURL,
          Password,
        } = req.body;
        const updatedEmployee = {
          EmployeeID,
          FirstName,
          LastName,
          Address,
          DOB,
          Contact,
          Gender,
          Position,
          Schedule,
          PhotoURL,
          Password,
        };

        if (FirstName) {
          updatedEmployee.FirstName = FirstName;
        }
        if (LastName) {
          updatedEmployee.LastName = LastName;
        }
        if (Address) {
          updatedEmployee.Address;
        }
        if (DOB) {
          updatedEmployee.DOB = DOB;
        }
        if (Contact) {
          updatedEmployee.Contact = Contact;
        }
        if (Gender) {
          updatedEmployee.Gender = Gender;
        }
        if (Position) {
          updatedEmployee.Position = Position;
        }
        if (Schedule) {
          updatedEmployee.Schedule = Schedule;
        }
        if (PhotoURL) {
          updatedEmployee.PhotoURL = PhotoURL;
        }
        if (Password) {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(Password, salt);
          updatedEmployee.Password = hashedPassword;
        }

        const newUpdateEmployee = await updateEmployeeService(
          updatedEmployee,
          EmployeeID
        );
        sendCreated(res, "Employee updated successfully");

        //sendBadRequest(res, error);

        //res.status(200).json(updatedUser);
        //console.log(updatedUser);
      } else {
        sendBadRequest(res, "Please provide a complete field");
      }
    }
  } catch (error) {
    sendServerError(res, error.message);
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await getEmployeesService();
    //console.log(data);
    const employeeToDelete = data.find((item) => item.EmployeeID == id);
    //console.log(userToDelete);
    if (!employeeToDelete) {
      sendNotFound(res, "User not found");
    } else {
      await deleteEmployeeService(id);
      sendDeleteSuccess(res, `Employee with ID ${id} deleted successfully`);
    }
  } catch (error) {
    sendServerError(res, error.message);
  }
};
