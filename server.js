require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const { logger, logEvents } = require("./middleware/logger");
const errHandler = require("./middleware/errHandler");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./config/dbConn");
const mongoose = require("mongoose");
const corsOptions = require("./config/corsOptions");

const PORT = process.env.PORT || 3500;

console.log(process.env.NODE_ENV);

connectDB();

app.use(logger); // use custom 'logger' middleware to log reqLog

app.use(cors(corsOptions)); // Thirdparty middleware

// BuiltIn Middleware: Add ability to parse json in your application
app.use(express.json());

// Thirdparty middleware - Parse cookies the we recieve
app.use(cookieParser());

// Tell express where to look for static files like CSS, JS, images etc
// 'express.static' is a built-in middleware which tells express where to find static files.
app.use("/", express.static(path.join(__dirname, "public")));

// route to the index file
app.use("/", require("./routes/root.js"));

// route for Users
app.use("/users", require("./routes/userRoutes"));
// route for Notes
app.use("/notes", require("./routes/notesRoutes"));

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

// Error handler Middleware
app.use(errHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server is running on ${PORT}`));
});

mongoose.connection.on("err", () => {
  console.log(err);
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrLog.log"
  );
});
