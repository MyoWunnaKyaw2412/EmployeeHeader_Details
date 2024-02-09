const db = require("../models/index");
const { sequelize } = require("../models");
const Employee = db.employees;
const Leavedays = db.leavedays;
const LeaveDays = require("../models/leavedays");
const { Op } = require("sequelize");

exports.createBulk = async (req, res) => {
  try {
    if (!req.body || !Array.isArray(req.body)) {
      return res.status(400).send({
        status: "Fail",
        message: "Invalid or empty request body for bulk insertion",
      });
    }

    // Extract IDs from the request body
    const newIds = req.body.map((Employee_Id) => Employee_Id.id);

    // Check if any of the new IDs already exist in the database
    const existingIds = await Employee.findAll({
      where: {
        Employee_Id: newIds,
      },
      attributes: ["Employee_Id"], // Only fetch the IDs for existing records
    });

    if (existingIds.length > 0) {
      return res.status(400).send({
        status: "Fail",
        message: "One or more IDs already exist in the database",
        existingIds: existingIds.map((record) => record.id),
      });
    }

    // Bulk Insert
    const createdEmployees = await Employee.bulkCreate(req.body);

    res.status(201).send({
      status: "Success",
      message: "Bulk insertion successful",
      data: createdEmployees,
    });
  } catch (error) {
    console.error(error);
    res.status(400).send({
      status: "Fail",
      message: "Error occurred during bulk insertion" || error.message,
    });
  }
};
exports.create = async (req, res) => {
  console.log(req.body);

  if (!req.body.Name) {
    return res.status(404).send({
      message: "Please enter your name",
    });
  }

  const existingEmployee = await Employee.findOne({
    where: { Employee_Id: req.body.Employee_Id },
  });

  if (existingEmployee) {
    return res.status(400).send({
      status: "Fail",
      message: "Employee ID already exists",
    });
  }

  console.log(req.body.Name);
  console.log(req.body.NRC_Exists);
  console.log(req.body.Employee_Id);

  Employee.create({
    Employee_Id: req.body.Employee_Id,
    Name: req.body.Name,
    Father_Name: req.body.Father_Name,
    DOB: req.body.DOB,
    Gender: req.body.Gender,
    NRC_Exists: req.body.NRC_Exists,
    NRC: req.body.NRC,
  })
    .then((data) => {
      res.status(201).send({
        status: "Success",
        message: "Successfully created",
        data: data,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).send({
        status: "Fail",
        message: "Some error occoured while creating a user" || err.message,
      });
    });
};

exports.findAll = (req, res) => {
  const title = req.query.email;
  var condition = title ? { title: { [Op.iLike]: `%${title}%` } } : null;

  Employee.findAll({ where: condition })
    .then((data) => {
      res.status(200).send({
        status: "Success",
        message: "Retrieved all tutorials.",
        data: data,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    });
};

exports.finbyPk = (req, res) => {
  const primId = req.params.id;

  Employee.findByPk(primId)
    .then((data) => {
      if (data) {
        res.status(200).send({
          status: "Success",
          data: data,
        });
      } else {
        res.status(404).send({
          status: "Fail",
          message: `Can't Find User with id ${primId}`,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        status: "Fail",
        message: "Error retrieving user with id! ",
      });
    });
};

exports.update = (req, res) => {
  const id = req.params.id;

  console.log(req.body.Employee_Id);
  console.log(req.body.NRC_Exists);
  console.log(req.body);
  Employee.update(req.body, {
    where: { Employee_Id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Update successfully.",
        });
      } else {
        res.send({
          message: `Cannot update Students with id=${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating Students with id=" + id,
      });
    });
};

exports.delete = (req, res) => {
  const id = req.params.id;

  Employee.destroy({
    where: {
      Employee_Id: id,
    },
  })
    .then((Number) => {
      if ((Number = 1)) {
        res.status(200).send({
          status: "Success",
          message: "Employee was deleted Successfully",
        });
      } else {
        res.status(404).send({
          status: "Fail",
          message: `Can't delete Employee with ${id}`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        status: "Fail",
        messsage: err.message || `Error deleting Employee with ${id}`,
      });
    });
};

exports.deleteAll = (req, res) => {
  Employee.destroy({
    where: {},
    truncate: false,
  })
    .then((Number) => {
      res.status(200).send({
        status: "Success",
        message: `${Number} Employee were deleted Successfully`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        status: "Fail",
        message:
          err.message || "Some error occoured while removing all Employee!",
      });
    });
};

//--------- one to Many------------------------------------------------------------------

exports.EmployeeLeaveDays = async (req, res) => {
  const id = req.params.id;

  try {
    const eldays = await Employee.findAll({
      where: { Employee_Id: id },
      include: [
        {
          model: db.leavedays,
          as: "leavedays",
        },
      ],
    });

    res.status(200).send({
      message: "Successfully received",
      data: eldays,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({
      message: "Internal Server Error",
    });
  }
};

// exports.DeleteEmployeeLeaveDays = async (req, res) => {
//   const id = req.params.id; // Assuming the employee ID is passed in the request parameters

//   try {
//     // Delete records from LeaveDays table
//     const deletedLeaveDays = await Leavedays.destroy({
//       where: { Employee_Id: id }, // Adjust the field name as per your model definition
//     });

//     res.status(200).send({
//       message: 'Successfully Deleted LeaveDays for Employee',
//       deletedLeaveDaysCount: deletedLeaveDays, // Number of deleted LeaveDays records
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({
//       message: 'Error occurred while deleting LeaveDays',
//       error: error.message,
//     });
//   }
// };

exports.DeleteEmployeeAndLeaveDays = async (req, res) => {
  const id = req.params.id; // Assuming the employee ID is passed in the request parameters

  try {
    // Delete Employee record
    const deletedEmployee = await Employee.destroy({
      where: { Employee_Id: id }, // Adjust the field name as per your model definition
    });

    // Delete related LeaveDays records
    const deletedLeaveDays = await Leavedays.destroy({
      where: { Employee_Id: id }, // Adjust the field name as per your model definition
    });

    res.status(200).send({
      message: "Successfully Deleted Employee and LeaveDays",
      deletedEmployeeCount: deletedEmployee, // Number of deleted Employee records
      deletedLeaveDaysCount: deletedLeaveDays, // Number of deleted LeaveDays records
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Error occurred while deleting Employee and LeaveDays",
      error: error.message,
    });
  }
};

exports.DeleteEmployeeLeaveDays = async (req, res) => {
  const id = req.params.id; // Assuming the employee ID is passed in the request parameters

  try {
    // Delete related LeaveDays records for the specified Employee_Id
    const deletedLeaveDays = await Leavedays.destroy({
      where: { Employee_Id: id }, 
    });

    res.status(200).send({
      message: "Successfully Deleted LeaveDays for Employee",
      deletedLeaveDaysCount: deletedLeaveDays, // Number of deleted LeaveDays records
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Error occurred while deleting LeaveDays for Employee",
      error: error.message,
    });
  }
};



// exports.updateOrCreateEmployeeAndLeaveDays = async (req, res) => {
//   try {
//     const {
//       Employee_Id,
//       Name,
//       Father_Name,
//       DOB,
//       Gender,
//       NRC_Exists,
//       NRC,
//       LeaveDays,
//     } = req.body;

//     if (!Employee_Id) {
//       return res.status(400).send({
//           message: "Please provide Employee_Id",
//       });
//   }
//   if (!Name) {
//       return res.status(400).send({
//           message: "Please provide Name",
//       });
//   }

//   if (!Father_Name) {
//       return res.status(400).send({
//           message: "Please provide Father's Name",
//       });
//   }
//   if (!DOB) {
//     return res.status(400).send({
//         message: "Please provide date of birth",
//     });
// }

// // Check if other fields are provided and valid
// if (!Gender) {
//     return res.status(400).send({
//         message: "Please provide Gender",
//     });
// }

// if (!NRC_Exists) {
//     return res.status(400).send({
//         message: "Please provide NRC_Exists",
//     });
// }
// if (!NRC) {
//   return res.status(400).send({
//       message: "Please provide NRC",
//   });
// }


//     const transaction = await sequelize.transaction();

//     try {
//       // Find the employee by Employee_Id
//       let employee = await Employee.findOne({
//         where: {
//           Employee_Id,
//         },
//       });

//       if (employee) {
//         // Employee exists, update employee details
//         await employee.update(
//           {
//             Name,
//             Father_Name,
//             DOB,
//             Gender,
//             NRC_Exists,
//             NRC,
//           },
//           { transaction }
//         );

//         // Delete all existing LeaveDays for the employee
//         await Leavedays.destroy({
//           where: {
//             Employee_Id,
//           },
//           transaction,
//         });

//         console.log(`Deleted LeaveDays for Employee ID: ${Employee_Id}`);
//       } else {
//         // Employee doesn't exist, create new employee
//         employee = await Employee.create(
//           {
//             Employee_Id,
//             Name,
//             Father_Name,
//             DOB,
//             Gender,
//             NRC_Exists,
//             NRC,
//           },
//           { transaction }
//         );

//         console.log(`Created new Employee with ID: ${Employee_Id}`);
//       }

//       // If LeaveDays are provided, create new LeaveDays entries
//       const leaveDaysData = LeaveDays.map((leaveDay) => ({
//         ...leaveDay,
//         Employee_Id,
//       }));

//       await Leavedays.bulkCreate(leaveDaysData, { transaction });

//       console.log(
//         `${leaveDaysData.length} LeaveDays created for Employee ID: ${Employee_Id}`
//       );

//       // Commit the transaction
//       await transaction.commit();

//       return res.status(200).send({
//         message: "Employee and LeaveDays updated/created successfully",
//       });
//     } catch (error) {
//       // Rollback the transaction if there's an error
//       await transaction.rollback();
//       console.log(error);
//       return res.status(500).send({
//         message: "Error occurred during Employee and LeaveDays update/creation" || error.message,
//       });
//     }
//   } catch (error) {
//     console.error(error);
//     alert(err.error.message);
//     return res.status(500).send({
//       message: "Database transaction error",
//     });
//   }
// };


exports.updateOrCreateEmployeeAndLeaveDays = async (req, res) => {
  try {
    const {
      Employee_Id,
      Name,
      Father_Name,
      DOB,
      Gender,
      NRC_Exists,
      NRC,
      LeaveDays,
    } = req.body;

    // Check if Employee_Id exists in the database
    const employeeExists = await Employee.findOne({
      where: {
        Employee_Id,
      },
    });

    // If the route is '/leave/:id', update the existing employee
    if (req.params.id && employeeExists) {
      // Update the existing employee
      await employeeExists.update({
        Name,
        Father_Name,
        DOB,
        Gender,
        NRC_Exists,
        NRC,
      });

      // Delete all existing LeaveDays for the employee
      await Leavedays.destroy({
        where: {
          Employee_Id,
        },
      });

      // If LeaveDays are provided, create new LeaveDays entries
      const leaveDaysData = LeaveDays.map((leaveDay) => ({
        ...leaveDay,
        Employee_Id,
      }));

      await Leavedays.bulkCreate(leaveDaysData);

      return res.status(200).send({
        message: "Employee and LeaveDays updated successfully",
      });
    }
    //  else {
    //   // If the Employee_Id doesn't exist and the route is not '/leave/:id', create a new employee
    //   if (!Employee_Id) {
    //     return res.status(400).send({
    //       message: "Please provide Employee_Id",
    //     });
    //   }
    //   if (!Name) {
    //     return res.status(400).send({
    //       message: "Please provide Name",
    //     });
    //   }
    //   if (!Father_Name) {
    //     return res.status(400).send({
    //       message: "Please provide Father's Name",
    //     });
    //   }
    //   if (!DOB) {
    //     return res.status(400).send({
    //       message: "Please provide date of birth",
    //     });
    //   }
    //   if (!Gender) {
    //     return res.status(400).send({
    //       message: "Please provide Gender",
    //     });
    //   }
    //   if (!NRC_Exists) {
    //     return res.status(400).send({
    //       message: "Please provide NRC_Exists",
    //     });
    //   }
    //   if (!NRC) {
    //     return res.status(400).send({
    //       message: "Please provide NRC",
    //     });
    //   }

    //   // Create a new employee
    //   const transaction = await sequelize.transaction();
    //   try {
    //     const employee = await Employee.create(
    //       {
    //         Employee_Id,
    //         Name,
    //         Father_Name,
    //         DOB,
    //         Gender,
    //         NRC_Exists,
    //         NRC,
    //       },
    //       { transaction }
    //     );

    //     // If LeaveDays are provided, create new LeaveDays entries
    //     if (LeaveDays && LeaveDays.length > 0) {
    //       const leaveDaysData = LeaveDays.map((leaveDay) => ({
    //         ...leaveDay,
    //         Employee_Id,
    //       }));
    //       await Leavedays.bulkCreate(leaveDaysData, { transaction });
    //     }

    //     await transaction.commit();

    //     return res.status(201).send({
    //       message: "Employee and LeaveDays created successfully",
    //     });
    //   } catch (error) {
    //     await transaction.rollback();
    //     console.error(error);
    //     return res.status(500).send({
    //       message: "Error occurred during Employee and LeaveDays creation",
    //     });
    //   }
    // }
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      message: "Database transaction error",
    });
  }
};


exports.CreateEmployeeLeavedays = async (req, res) => {
  console.log(req.body);

  const {
    Employee_Id,
    Name,
    Father_Name,
    DOB,
    Gender,
    NRC_Exists,
    NRC,
    LeaveDays,
  } = req.body;

  {


    const existingEmployee = await Employee.findOne({
      where: { Employee_Id: req.body.Employee_Id },
    });
  
    if (existingEmployee) {
      return res.status(400).send({
        status: "Fail",
        message: "Employee ID already exists",
      });
    }

      // If the Employee_Id doesn't exist and the route is not '/leave/:id', create a new employee
      if (!Employee_Id) {
        return res.status(400).send({
          message: "Please provide Employee_Id",
        });
      }
      if (!Name) {
        return res.status(400).send({
          message: "Please provide Name",
        });
      }
      if (!Father_Name) {
        return res.status(400).send({
          message: "Please provide Father's Name",
        });
      }
      if (!DOB) {
        return res.status(400).send({
          message: "Please provide date of birth",
        });
      }
      if (!Gender) {
        return res.status(400).send({
          message: "Please provide Gender",
        });
      }
      if (!NRC_Exists) {
        return res.status(400).send({
          message: "Please provide NRC_Exists",
        });
      }
      if (!NRC) {
        return res.status(400).send({
          message: "Please provide NRC",
        });
      }

      // Create a new employee
      const transaction = await sequelize.transaction();
      try {
        const employee = await Employee.create(
          {
            Employee_Id,
            Name,
            Father_Name,
            DOB,
            Gender,
            NRC_Exists,
            NRC,
          },
          { transaction }
        );

        // If LeaveDays are provided, create new LeaveDays entries
        if (LeaveDays && LeaveDays.length > 0) {
          const leaveDaysData = LeaveDays.map((leaveDay) => ({
            ...leaveDay,
            Employee_Id,
          }));
          await Leavedays.bulkCreate(leaveDaysData, { transaction });
        }

        await transaction.commit();

        return res.status(201).send({
          message: "Employee and LeaveDays created successfully",
        });
      } catch (error) {
        await transaction.rollback();
        console.error(error);
        return res.status(500).send({
          message: "Error occurred during Employee and LeaveDays creation",
        });
      }
    }
};



exports.createOrUpdateEmployeeLeavedays = async (req, res) => {
  console.log(req.body);

  const {
    Employee_Id,
    Name,
    Father_Name,
    DOB,
    Gender,
    NRC_Exists,
    NRC,
    LeaveDays,
  } = req.body;

  if (!req.body.Employee_Id) {
    return res.status(400).send({
        message: "Please provide Employee_Id",
    });
}
if (!Name) {
    return res.status(400).send({
        message: "Please provide Name",
    });
}

if (!Father_Name) {
    return res.status(400).send({
        message: "Please provide Father's Name",
    });
}
if (!DOB) {
  return res.status(400).send({
      message: "Please provide date of birth",
  });
}

// Check if other fields are provided and valid
if (!Gender) {
  return res.status(400).send({
      message: "Please provide Gender",
  });
}

if (!NRC_Exists) {
  return res.status(400).send({
      message: "Please provide NRC_Exists",
  });
}
if (!NRC) {
return res.status(400).send({
    message: "Please provide NRC",
});
}


  try {
    const existingEmployee = await Employee.findOne({
      where: { Employee_Id },
    });

    if (!existingEmployee) {
      // If the employee doesn't exist, create a new employee and associated leave days
      const createdEmployee = await db.sequelize.transaction(async (t) => {
        const employee = await Employee.create(
          {
            Employee_Id,
            Name,
            Father_Name,
            DOB,
            Gender,
            NRC_Exists,
            NRC,
          },
          { transaction: t }
        );

        const leaveDays = await Leavedays.bulkCreate(
          LeaveDays.map((leaveDay) => ({
            ...leaveDay,
          })),
          { transaction: t }
        );

        await employee.setLeavedays(leaveDays, { transaction: t });

        return employee;
      });

      res.status(201).send({
        status: "Success",
        message: "Employee and LeaveDays created successfully",
        data: createdEmployee,
      });
    } else {
      // If the employee exists, add more leave days
      const addedLeaveDays = await Leavedays.bulkCreate(
        LeaveDays.map((leaveDay) => ({
          ...leaveDay,
        }))
      );

      await existingEmployee.addLeavedays(addedLeaveDays);

      res.status(200).send({
        status: "Success",
        message: "LeaveDays added to the existing employee successfully",
        data: existingEmployee,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      status: "Fail",
      message: "Error occurred during creation or update" || error.message,
    });
  }
};



exports.createOrUpdateEmployeeLeavedaystoImport = async (req, res) => {
  console.log(req.body);

  if (!Array.isArray(req.body)) {
    return res.status(400).send({ message: "Request body must be an array" });
  }

  try {
    await sequelize.transaction(async (t) => {
      for (const employeeData of req.body) {
        const { Employee_Id, Name, Father_Name, DOB, Gender, NRC_Exists, NRC, LeaveDays } = employeeData;

        if (!Employee_Id || !Name || !LeaveDays || LeaveDays.length === 0) {
          return res.status(400).send({
            message: "Please provide a valid Employee_Id, Name, and at least one leave day for each employee",
          });
        }

        let existingEmployee = await Employee.findOne({ where: { Employee_Id } });

        if (!existingEmployee) {
          existingEmployee = await Employee.create(
            { Employee_Id, Name, Father_Name, DOB, Gender, NRC_Exists, NRC },
            { transaction: t }
          );
        } else {
          await existingEmployee.setLeavedays([], { transaction: t });
        }

        const newLeaveDays = await Leavedays.bulkCreate(
          LeaveDays.map((leaveDay) => ({ ...leaveDay })),
          { transaction: t }
        );

        await existingEmployee.addLeavedays(newLeaveDays, { transaction: t });

        console.log("Employee and LeaveDays updated successfully:", existingEmployee);
      }
    });

    res.status(200).send({
      status: "Success",
      message: "Employee and leave days updated successfully",
    });
  } catch (error) {
    console.error("Error occurred during creation or update of employee and leave days:", error);
    res.status(500).send({
      status: "Fail",
      message: "Error occurred during creation or update of employee and leave days",
      error: error.message,
    });
  }
};


// exports.getEmployeeById = async (req, res) => {
//   const { employeeId } = req.params;

//   try {
//     // Query the database to find the employee by ID
//     const employee = await Employee.findOne({
//       where: { Employee_Id: employeeId },
//     });

//     if (employee) {
//       // If the employee exists, return it in the response
//       return res.status(200).json(employee);
//     } else {
//       // If the employee doesn't exist, return a 404 Not Found status
//       return res.status(404).json({ message: "Employee not found" });
//     }
//   } catch (error) {
//     // If an error occurs, return a 500 Internal Server Error status
//     console.error("Error fetching employee:", error);
//     return res.status(500).json({ message: "Error fetching employee" });
//   }
// };

exports.getEmployeeById = async (req, res) => {
  const { employeeId } = req.params;

  try {
    // Query the database to find the employee by ID
    const employee = await Employee.findOne({
      where: { Employee_Id: employeeId },
    });

    if (employee) {
      // If the employee exists, return true
      return res.status(200).json({ exists: true });
    } else {
      // If the employee doesn't exist, return false
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    // If an error occurs, return a 500 Internal Server Error status
    console.error("Error fetching employee:", error);
    return res.status(500).json({ message: "Error fetching employee" });
  }
};

// exports.EmployeeAndLeavedays = async (req, res) => {
//   // Extract data from the request
//   const { Employee_Id, Name, Father_Name, DOB, Gender, NRC_Exists, NRC } =
//     req.body;
//   try {
//     let employeeData;
//     // Use Sequelize's transaction to ensure atomicity
//     await db.sequelize.transaction(async (t) => {
//       // Validate order data
//       const posformDataValidation = await validatePosformDataForCreate({
//         Employee_Id,
//         Name,
//         Father_Name,
//         DOB,
//         Gender,
//         NRC_Exists,
//         NRC,
//       });
//       if (!posformDataValidation.success) {
//         return res.status(400).send({
//           status: "Error",
//           message: posformDataValidation.message,
//         });
//       }
//       // Create order record
//       employeeData = await Employee.create(
//         {
//           Employee_Id,
//           Father_Name,
//           DOB,
//           Name,
//           Gender,
//           NRC_Exists,
//           NRC,
//         },
//         { transaction: t }
//       );
//       // Check if order creation was successful
//       if (!employeeData) {
//         return res.status(500).send({
//           status: "Error",
//           message: "Failed to create order.",
//         });
//       }
//       // Set stock data with order_id
//       const LeaveDataArray = LeaveDays.map((leavedata) => {
//         const remainingLeaveDays =
//           leavedata.Number_of_Leave_Days +
//           leavedata.Opening_Leave_Days +
//           leavedata.Brought_Forward -
//           leavedata.Taken_Leave_Days;
//         return {
//           Employee_Id: employeeData.Employee_Id,
//           Leave_Type: leavedata.Leave_Type,
//           Number_of_Leave_Days: leavedata.price,
//           Opening_Leave_Days: leavedata.quantity,
//           Brought_Forward: leavedata.Brought_Forward,
//           Taken_Leave_Days: leavedata.Taken_Leave_Days,
//           Remaining_Leave_Days: remainingLeaveDays,
//           Leave_Year: leavedata.Leave_Year,
//           Carry_Forward: leavedata.Carry_Forward,
//         };
//       });
//       const validatedData = validateBulkData(LeaveDataArray);
//       console.log("Validated Data:", validatedData);
//       // Use bulkCreate to insert multiple stock records
//       await Leavedays.bulkCreate(validatedData.data, { transaction: t });
//       // If needed, you can query the created stock records after bulkCreate
//       const createdLeaveRecords = await Leavedays.findAll({
//         where: { Employee_Id: employeeData.Employee_Id },
//         transaction: t,
//       });
//       console.log("Created Stock Records:", createdLeaveRecords);
//       // Send the success response inside the transaction
//       res.status(200).send({
//         status: "Success",
//         message: "Data creation successful",
//         employeeData: employeeData, // Include the order information in the response
//       });
//       // Add a return statement to terminate the function execution after sending the response
//       return;
//     });
//     // If the code reaches this point, it means the transaction was successful, but the response was already sent inside the transaction
//   } catch (error) {
//     // Handle database query errors
//     console.error(error);
//     res.status(500).send({
//       status: "Error",
//       message: "Internal Server Error",
//     });
//   }
// };

// function validateSingleData(data) {
//   console.log("Raw Data:", data);
//   const validatedData = { success: true, message: null, data: null };
//   const validItems = [
//     "Casual",
//     "Medical",
//     "Hospitalization",
//     "Without",
//     "Paid",
//     "Maternity",
//     "Annual",
//   ];
//   if (typeof data.Leave_Type !== "string" || data.Leave_Type == null) {
//     validatedData.success = false;
//     validatedData.message = `Invalid Leave_Type. Must be a string and cannot be null.`;
//     return validatedData;
//   }
//   if (!validItems.includes(data.Leave_Type)) {
//     validatedData.success = false;
//     validatedData.message = `Invalid Leave_Type. Must be one of: ${validItems.join(
//       ", "
//     )}.`;
//     return validatedData;
//   }
//   if (
//     data.Number_of_Leave_Days == null ||
//     typeof data.Number_of_Leave_Days !== "number"
//   ) {
//     validatedData.success = false;
//     validatedData.message = `Invalid Number_of_Leave_Days. Must be a number and Number_of_Leave_Days cannot be null.`;
//     return validatedData;
//   }
//   if (
//     typeof data.Opening_Leave_Days !== "number" ||
//     data.Opening_Leave_Days == null
//   ) {
//     validatedData.success = false;
//     validatedData.message = `Invalid Opening_Leave_Days. Must be a number and Opening_Leave_Days cannot be null.`;
//     return validatedData;
//   }
//   if (
//     typeof data.Brought_Forward !== "number" ||
//     data.Brought_Forward == null
//   ) {
//     validatedData.success = false;
//     validatedData.message = `Invalid Brought_Forward. Must be a number and Brought_Forward cannot be null.`;
//     return validatedData;
//   }
//   if (
//     typeof data.Taken_Leave_Days !== "number" ||
//     data.Taken_Leave_Days == null
//   ) {
//     validatedData.success = false;
//     validatedData.message = `Invalid Taken_Leave_Days. Must be a number and Taken_Leave_Days cannot be null.`;
//     return validatedData;
//   }
//   if (
//     typeof data.Remaining_Leave_Days !== "number" ||
//     data.Remaining_Leave_Days == null
//   ) {
//     validatedData.success = false;
//     validatedData.message = `Invalid Remaining_Leave_Days. Must be a number and Remaining_Leave_Days cannot be null.`;
//     return validatedData;
//   }

//   if (data.Employee_Id == null || typeof data.Employee_Id !== "number") {
//     validatedData.success = false;
//     validatedData.message = `Invalid Employee_Id. Must be a number and Employee_Id cannot be null.`;
//     return validatedData;
//   }
//   validatedData.data = data;
//   return validatedData;
// }
// function validateBulkData(data) {
//   console.log("Raw Data:", data);
//   const validatedData = { success: true, message: null, data: [] };
//   const validItems = [
//     "Casual",
//     "Medical",
//     "Hospitalization",
//     "Without",
//     "Paid",
//     "Maternity",
//     "Annual",
//   ];
//   if (!Array.isArray(data)) {
//     validatedData.success = false;
//     validatedData.message = "Invalid data format. Must be an array.";
//     return validatedData;
//   }
//   data.forEach((row) => {
//     if (typeof row.Leave_Type !== "string" || row.Leave_Type == null) {
//       validatedData.success = false;
//       validatedData.message = `Invalid Leave_Type. Must be a string or cannot be null.`;
//       return; // Exit early
//     }
//     if (!validItems.includes(row.Leave_Type)) {
//       validatedData.success = false;
//       validatedData.message = `Invalid Leave_Type. Must be one of: ${validItems.join(
//         ", "
//       )}.`;
//       return; // Exit early
//     }
//     if (
//       row.Number_of_Leave_Days == null ||
//       typeof row.Number_of_Leave_Days !== "number"
//     ) {
//       validatedData.success = false;
//       validatedData.message = `Invalid Number_of_Leave_Days. Must be a number or Number_of_Leave_Days cannot be null.`;
//       return; // Exit early
//     }
//     if (
//       typeof row.Opening_Leave_Days !== "number" ||
//       row.Opening_Leave_Days == null
//     ) {
//       validatedData.success = false;
//       validatedData.message = `Invalid Opening_Leave_Days. Must be a number or Opening_Leave_Days cannot be null.`;
//       return; // Exit early
//     }

//     if (row.Employee_Id == null || typeof row.Employee_Id !== "number") {
//       validatedData.success = false;
//       validatedData.message = `Invalid Employee_Id. Must be a number orEmployee_Id cannot be null.`;
//       return; // Exit early
//     }
//     // Add other validations as needed
//     if (validatedData.success) {
//       validatedData.data.push(row);
//     }
//   });
//   return validatedData;
// }
// //validation Stock and create
// async function validatePosformDataForCreate(data) {
//   const { Employee_Id, Name, Father_Name } = data;
//   const validation = { success: true, message: null };
//   // Validate Employee_Id is a number
//   if (typeof Employee_Id !== "number" || Employee_Id == null) {
//     validation.success = false;
//     validation.message = "Invalid Employee_Id. Must be a number.Cannot be null";
//     return validation;
//   }
//   // Check for uniqueness of Employee_Id
//   const existingOrder = await Employee.findOne({ where: { Employee_Id } });
//   if (existingOrder) {
//     validation.success = false;
//     validation.message = "Order with the provided Employee_Id already exists.";
//     return validation;
//   }
//   // Validate counter_no is an integer
//   // if (typeof counter_no !== "number" || !Number.isInteger(counter_no) || counter_no == null) {
//   //   validation.success = false;
//   //   validation.message = "Invalid counter_no. Must be an integer.Cannot Be Null";
//   //   return validation;
//   // }
//   // console.log(typeof casher_name,">>>>>>>>>>>")
//   // // Validate casher_name is a string
//   // if ( typeof casher_name !== 'string'|| casher_name == null ||  /^\d+$/.test(casher_name.trim())) {
//   //   validation.success = false;
//   //   validation.message = "Invalid casher_name. Must be a string. Cannot be null.";
//   //   return validation;
//   // }
//   // // Validate discount_percentage is a number not greater than 100
//   // if (typeof discount_percentage !== "number" || discount_percentage > 100) {
//   //   validation.success = false;
//   //   validation.message =
//   //     "Invalid discount_percentage. Must be a number not greater than 100.";
//   //   return validation;
//   // }
//   // Add other validations for Posform fields as needed
//   return validation;
// }
// //validation for createOrder and Stock
// function validatePosformData(data) {
//   const { Employee_Id, Name, Father_Name, Gender, NRC_Exists, NRC } = data;
//   const validation = { success: true, message: null };
//   // Validate order_id is a number
//   if (
//     typeof Employee_Id != "number" ||
//     typeof Employee_Id == "string" ||
//     Employee_Id == null
//   ) {
//     validation.success = false;
//     validation.message =
//       "Invalid Employee_Id. Must be a number or a string representing a number and Cannot be null";
//     return validation;
//   }
//   // Check for uniqueness of order_id (you may need to implement this based on your database model)
//   // Validate counter_no is an integer
//   // if (typeof counter_no !== "number" || !Number.isInteger(counter_no) || counter_no == null) {
//   //   validation.success = false;
//   //   validation.message = "Invalid counter_no. Must be an integer.counter_no cannot be null";
//   //   return validation;
//   // }
//   // // Validate casher_name is a string
//   // if (typeof casher_name !== "string" || casher_name == null ) {
//   //   validation.success = false;
//   //   validation.message = "Invalid casher_name. Must be a string or cannot be null";
//   //   return validation;
//   // }
//   // // Validate discount_percentage is a number not greater than 100
//   // if (typeof discount_percentage !== "number" || discount_percentage > 100) {
//   //   validation.success = false;
//   //   validation.message =
//   //     "Invalid discount_percentage. Must be a number not greater than 100.";
//   //   return validation;
//   // }
//   return validation;
// }
// function validateOrderID(data) {
//   const { Employee_Id } = data;
//   const validation = { success: true, message: null };
//   // Validate order_id is a number
//   if (
//     typeof Employee_Id != "number" ||
//     typeof Employee_Id == "string" ||
//     Employee_Id == null
//   ) {
//     validation.success = false;
//     validation.message =
//       "Invalid Employee_Id. Must be a number or a string representing a number or cannot be null";
//     return validation;
//   }
//   return validation;
// }
