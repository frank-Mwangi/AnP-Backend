import { poolRequest, sql } from "../utils/dbConnect.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const createEmployeeService = async (newEmployee) => {
  try {
    const result = await poolRequest()
      .input("FirstName", sql.VarChar(255), newEmployee.FirstName)
      .input("LastName", sql.VarChar(255), newEmployee.LastName)
      .input("Address", sql.VarChar(255), newEmployee.Address)
      .input("DOB", sql.Date, newEmployee.DOB)
      .input("Contact", sql.Int, newEmployee.Contact)
      .input("Gender", sql.VarChar, newEmployee.Gender.toLowerCase())
      .input("Position", sql.VarChar, newEmployee.Position.toLowerCase())
      .input("Schedule", sql.VarChar, newEmployee.Schedule.toLowerCase())
      .input("PhotoURL", sql.VarChar, newEmployee.PhotoURL)
      .input("Email", sql.VarChar, newEmployee.Email.toLowerCase())
      .input("Password", sql.VarChar, newEmployee.hashedPassword)
      .input("Admin", sql.Bit, newEmployee.Admin)
      .query(
        "INSERT INTO Employee (FirstName, LastName, Address, DOB, Contact, Gender, Position, Schedule, PhotoURL, Email, Password, Admin) VALUES (@FirstName, @LastName, @Address, @DOB, @Contact, @Gender, @Position, @Schedule, @PhotoURL, @Email, @Password, @Admin)"
      );
    console.log(result);
    return result;
  } catch (error) {
    return error;
  }
};

export const getEmployeeByEmailService = async (Email) => {
  try {
    const result = await poolRequest()
      .input("Email", sql.VarChar(255), Email.toLowerCase())
      .query("SELECT * FROM Employee WHERE Email = @Email");
    return result.recordset;
  } catch (error) {
    return error;
  }
};

export const getEmployeesService = async () => {
  try {
    const result = await poolRequest().query("SELECT * FROM Employee");
    return result.recordset;
  } catch (error) {
    return error.message;
  }
};

export const updateEmployeeService = async (employee, EmployeeID) => {
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
  } = employee;
  try {
    const result = await poolRequest()
      .input("EmployeeID", sql.Int, EmployeeID)
      .input("FirstName", sql.VarChar, FirstName)
      .input("LastName", sql.VarChar, LastName)
      .input("Address", sql.VarChar, Address)
      .input("DOB", sql.Date, DOB)
      .input("Contact", sql.Int, Contact)
      .input("Gender", sql.VarChar, Gender.toLowerCase())
      .input("Position", sql.VarChar, Position.toLowerCase())
      .input("Schedule", sql.VarChar, Schedule.toLowerCase())
      .input("PhotoURL", sql.VarChar, PhotoURL)
      .input("Password", sql.VarChar, Password)
      .query(
        "UPDATE Employee SET FirstName = @FirstName, LastName = @LastName, Address = @Address, DOB = @DOB, Contact = @Contact, Gender = @Gender, Position = @Position, Schedule = @Schedule, PhotoURL = @PhotoURL,  Password = @Password WHERE EmployeeID = @EmployeeID"
      );

    return result;
  } catch (error) {
    //console.log(error);
    return error;
  }
};

export const findByCredentialsService = async (employee) => {
  try {
    const employeeFoundResponse = await poolRequest()
      .input("Email", sql.VarChar, employee.Email.toLowerCase())
      .query("SELECT * FROM Employee WHERE Email=@Email");
    if (employeeFoundResponse.recordset[0]) {
      if (
        await bcrypt.compare(
          employee.Password,
          employeeFoundResponse.recordset[0].Password
        )
      ) {
        let token = jwt.sign(
          {
            id: employeeFoundResponse.recordset[0].EmployeeID,
            FirstName: employeeFoundResponse.recordset[0].FirstName,
            email: employeeFoundResponse.recordset[0].Email,
          },

          process.env.JWT_SECRET,
          { expiresIn: "72h" }
        );
        const { Password, ...employee } = employeeFoundResponse.recordset[0];
        console.log("Employee is", employee);
        console.log("Token is", token);
        return { employee, token: `JWT ${token}` };
      } else {
        return { error: "Invalid Credentials" };
      }
    } else {
      return { error: "Invalid Credentials" };
    }
  } catch (error) {
    return error;
  }
};

export const deleteEmployeeService = async (EmployeeID) => {
  try {
    await poolRequest()
      .input("EmployeeID", sql.Int, EmployeeID)
      .query("DELETE FROM Employee WHERE EmployeeID=@EmployeeID");
  } catch (error) {
    return error.message;
  }
};
