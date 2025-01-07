const { format } = require("date-fns");
const { v4: uuid } = require("uuid"); //
const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");

// create a function that loggs the errors logs

const logEvents = async (message, logFileName) => {
  const dateTime = format(new Date(), "yyyyMMdd\tHH:mm:ss");

  // \t means tabs, those makes it easy to transfer logs over the excel if needed
  // uuid - creates a specific id
  // \n - new line
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

  try {
    // if log folder is not available, create it
    if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
      await fsPromises.mkdir(path.join(__dirname, "..", "logs"));
    }

    // Add the log message to the file.
    await fsPromises.appendFile(
      path.join(__dirname, "..", "logs", logFileName),
      logItem
    );
  } catch (err) {
    console.log(err);
  }
};

// create middleware
// middleware has req, res and ability to call 'next' to move on to next peice of middleware
const logger = (req, res, next) => {
  logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, "reqLog.log");
  console.log(`${req.method} ${req.path}`);
  next();
};

module.exports = { logEvents, logger };
