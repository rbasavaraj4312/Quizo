const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: (arr) => arr.length >= 2, // Ensure at least 2 options
      message: "A question must have at least two options.",
    },
  },
  correctAnswer: {
    type: String,
    required: true,
  },
});

const QuizSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuizoUsers",
      required: true,
    },
    title: {
      type: String,
      required: true,
      unique: true,
    },
    subject: {
      type: String,
      required: true,
    },
    marksPerQuestion: {
      type: Number,
      required: true,
      min: 1,
    },
    negativeMarking: {
      type: Boolean,
      default: false,
    },
    startDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value > new Date();
        },
        message: "Start date must be in the future.",
      },
    },
    endDate: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    unidirectional: {
      type: Boolean,
      default: false,
    },
    questions: {
      type: [QuestionSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["draft", "active", "completed"],
      default: "draft",
    },
    students: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "QuizoUsers",
          required: true,
        },
        time: { type: Date, default: Date.now },
        score: { type: Number, default: 0 },
        responses: [
          {
            questionId: { type: mongoose.Schema.Types.ObjectId },
            selectedOption: { type: String },
            isCorrect: { type: Boolean },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

QuizSchema.pre("save", function (next) {
  const currentDate = new Date();
  if (this.startDate && this.endDate) {
    if (currentDate >= this.startDate && currentDate <= this.endDate) {
      this.status = "active";
    } else if (currentDate > this.endDate) {
      this.status = "completed";
    }
  }
  next();
});

const Quiz = mongoose.model("Quiz", QuizSchema);
module.exports = Quiz;
