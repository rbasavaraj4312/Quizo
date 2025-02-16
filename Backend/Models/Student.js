const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema(
  {
    userType: {
      type: String,
      enum: ["student", "teacher"],
      default: "student",
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    userName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Student = mongoose.model("QuizoUsers", StudentSchema);
module.exports = Student;
