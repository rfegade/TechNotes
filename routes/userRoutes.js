const express = require("express");
const router = express.Router();
// import user controller
const usersController = require("../controllers/userController");

router
  .route("/")
  .get(usersController.getAllUsers)
  .post(usersController.createNewUser)
  .patch(usersController.updateUser)
  .delete(usersController.deleteUser);

module.exports = router;
