const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // mongodb provides createdAt and updated by setting this option
  }
);

// create autoIncrement sequence to generate ticket numbers.
// it will create a field in Notes screema for ticket number

// This plugin will create a seperate collection called counter where it tracks the sequencial numbers and continues to insert it into our Notes.
noteSchema.plugin(AutoIncrement, {
  inc_field: "ticket", // field name
  id: "ticketNums", // wont see thin in notes collection. seperate collction called counter will be created, we will see it in counter collection
  start_seq: 500,
});

module.exports = mongoose.model("Note", noteSchema);
