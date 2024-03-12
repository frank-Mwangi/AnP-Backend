import joi from "joi";

export const employeeValidator = (employee) => {
  const employeeValidatorSchema = joi.object({
    FirstName: joi.string().min(3).max(255).required(),
    LastName: joi.string().min(3).max(255).required(),
    Address: joi.string().alphanum().required(),
    DOB: joi.date().required(),
    Contact: joi.string().required(),
    Gender: joi.string().min(3).max(50).required(),
    Position: joi.string().required(),
    Schedule: joi.string().required(),
    PhotoURL: joi.string().required(),
    Email: joi.string().email().required(),
    Password: joi.string().min(4).required(),
  });
  return employeeValidatorSchema.validate(employee);
};

export const employeeLoginValidator = (employee) => {
  const employeeLoginValidatorSchema = joi.object({
    Email: joi.string().email().required(),
    Password: joi.string().min(4).required(),
  });
  return employeeLoginValidatorSchema.validate(employee);
};
