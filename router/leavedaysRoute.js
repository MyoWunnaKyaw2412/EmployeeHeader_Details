const express = require("express");
const leavedaysCtrl = require("../controller/leavedaysCtrl");

module.exports = (app) => {

    const leaveRouter = express.Router();

    leaveRouter.post("/",leavedaysCtrl.createLeavedays);

    leaveRouter.get("/",leavedaysCtrl.findAll);

    leaveRouter.get("/:id",leavedaysCtrl.finbyPk);

    leaveRouter.patch("/:id",leavedaysCtrl.update);

    leaveRouter.delete("/:id",leavedaysCtrl.deleteLeaveDays);

    leaveRouter.post("/bulkinsert",leavedaysCtrl.createBulk);
    
    app.use("/api/v1/leavedays",leaveRouter);
}