const app = require("./app");
const cors = require("cors");
const express = require("express");
const db = require("./models/index");
const port = 8000;

var corsOption = {
    origin: "*",
}

db.sequelize
  .sync()
  .then(() => {
    console.log("Synced db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });

app.use(cors(corsOption));

app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));


app.get("/", (req, res) => {
    res.json({ message: "Welcome to nodejs application." });
  });

require("./router/employeeRoute")(app);
require("./router/leavedaysRoute")(app);

app.listen(port,()=>{
    console.log(`Sever is running on ${port}`);
})