const express = require("express");
const userCtrl = require("../controller/employeeCtrl");

module.exports = (app) => {
    const router = express.Router();

        router.post("/bulkInsert",userCtrl.createBulk);

        router.post("/",userCtrl.create);

        router.get("/",userCtrl.findAll);
        
        router.get("/:id",userCtrl.finbyPk);

        router.patch("/:id",userCtrl.update);

        router.delete("/:id",userCtrl.delete);

        router.delete("/",userCtrl.deleteAll);
//----------------------------------------------------------------------------------------------------------
        router.get("/employeeleavedays/:id",userCtrl.EmployeeLeaveDays);

        router.delete("/deleteEmployeeAndleavedays/:id",userCtrl.DeleteEmployeeAndLeaveDays);

        router.delete("/deleteleavedays/:id",userCtrl.DeleteEmployeeLeaveDays);

        router.post("/createleavedays/createAll",userCtrl.createOrUpdateEmployeeLeavedays);
 
        router.post("/importEmployeeLeaveDays/import",userCtrl.createOrUpdateEmployeeLeavedaystoImport);

        router.get("/checkID",userCtrl.getEmployeeById);

        router.post("/updatedata/:id",userCtrl.updateOrCreateEmployeeAndLeaveDays); 

        router.post("/createEmployeeAndLeave",userCtrl.CreateEmployeeLeavedays);

        // router.post("/createEmployeeAndLeaves",userCtrl.createEmployeeAndLeaves);

        // router.post("/EmployeeAndLeave",userCtrl.EmployeeAndLeavedays);



        app.use("/api/v1/employee",router);

}