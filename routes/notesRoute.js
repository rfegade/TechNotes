const express = require("express");
const router = express.Router();

// import notes controller
const notesController = require("../controllers/noteController");

router
  .route("/")
  .get(notesController.getAllNotes)
  .post(notesController.createNewNote)
  .patch(notesController.updateNote)
  .delete(notesController.deleteNote);

module.exports = router;
