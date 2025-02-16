const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = 4000;
const cors = require("cors");
const bcrypt = require("bcrypt");

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Quizo running");
});

mongoose
  .connect(
    "mongodb+srv://rbasavaraj0312:Basavaraj1234@node.zy6xw.mongodb.net/?retryWrites=true&w=majority&appName=Node"
  )
  .then(() => {
    console.log("Connected to database");
    app.listen(port, "0.0.0.0", () => {
      console.log(`Server running on ${port} port at localhost`);
    });
  })
  .catch(() => {
    console.log("Database connection failed");
  });

const Users = require("./Models/Student");

app.post("/signup", async (req, res) => {
  const { userType, userName, email, password } = req.body;
  try {
    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new Users({
      userType,
      userName,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    } else {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        res.status(200).json({ message: "Login successful", user });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    }
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
});

app.get("/teachers", async (req, res) => {
  try {
    const teachers = await Users.find({ userType: "teacher" });
    res.json(teachers);
  } catch (error) {
    console.error("Error fetching teachers:", error);
    res.status(500).json({ message: "Error fetching teachers" });
  }
});

app.delete("/teachers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await Users.findOne({ _id: id });

    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    await teacher.deleteOne();
    res.json({ message: "Teacher deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting teacher" });
  }
});

// Add this after your existing code

const Quiz = require("./Models/Quiz");

// Create a new quiz
app.post("/create-quiz", async (req, res) => {
  const {
    createdBy,
    title,
    subject,
    marksPerQuestion,
    negativeMarking,
    startDate,
    endDate,
    questions,
    duration,
    unidirectional,
  } = req.body;

  // Validate required fields
  if (
    !createdBy ||
    !title ||
    !subject ||
    !marksPerQuestion ||
    !startDate ||
    !endDate ||
    !questions.length ||
    !duration
  ) {
    return res.status(400).json({
      message:
        "All fields are required, including at least one question and duration.",
    });
  }

  // Validate date format
  if (
    isNaN(new Date(startDate).getTime()) ||
    isNaN(new Date(endDate).getTime())
  ) {
    return res.status(400).json({ message: "Invalid date format." });
  }

  // Validate startDate is in the future
  if (new Date(startDate) <= new Date()) {
    return res
      .status(400)
      .json({ message: "Start date must be in the future." });
  }
  // Validate startDate is before endDate
  if (new Date(startDate) >= new Date(endDate)) {
    return res
      .status(400)
      .json({ message: "Start date must be before end date." });
  }

  try {
    const user = await Users.findById(createdBy);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const newQuiz = new Quiz({
      createdBy: user._id, // Use the ObjectId instead of a string
      title,
      subject,
      marksPerQuestion,
      negativeMarking,
      startDate,
      endDate,
      questions,
      duration,
      unidirectional,
    });

    // Validate the quiz using Mongoose's built-in validation
    try {
      await newQuiz.save();
      res
        .status(201)
        .json({ message: "Quiz created successfully", quiz: newQuiz });
    } catch (validationError) {
      console.error("Validation error:", validationError);
      return res.status(400).json({
        message: "Quiz validation failed",
        errors: validationError.errors, // Provide detailed validation errors
      });
    }
  } catch (error) {
    console.error("Error creating quiz:", error);
    res
      .status(500)
      .json({ message: "Error creating quiz", error: error.message });
  }
});

// All live quizes
app.get("/live-quizzes", async (req, res) => {
  try {
    const currentTime = new Date();
    const liveQuizzes = await Quiz.find({
      startDate: { $lte: currentTime },
      endDate: { $gte: currentTime },
    })
      .populate("createdBy", "userName") // Fetch only userName from QuizoUsers
      .exec();

    res.status(200).json(liveQuizzes);
  } catch (error) {
    console.error("Error fetching live quizzes:", error);
    res.status(500).json({ message: "Error fetching live quizzes" });
  }
});

app.post("/submit-quiz", async (req, res) => {
  let { quizId, studentId, name, answers, score } = req.body;

  if (!studentId) {
    return res.status(400).json({ message: "Student ID is required." });
  }

  try {
    // Use findOneAndUpdate to atomically check and insert
    const quiz = await Quiz.findOneAndUpdate(
      {
        _id: quizId,
        "students.studentId": { $ne: studentId }, // ✅ Ensures student is not already in students array
      },
      {
        $push: {
          students: {
            studentId,
            name,
            time: new Date(),
            score,
            responses: Object.keys(answers).map((qId) => ({
              questionId: qId,
              selectedOption: answers[qId],
              isCorrect: answers[qId] === "correctAnswer",
            })),
          },
        },
      },
      { new: true }
    );

    if (!quiz) {
      return res
        .status(400)
        .json({ message: "You have already attempted this quiz." });
    }

    res.json({ message: "Quiz submitted successfully", score });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    res
      .status(500)
      .json({ message: "Error submitting quiz", error: error.message });
  }
});

app.get("/check-quiz-attempt", async (req, res) => {
  const { quizId, studentId } = req.query;

  try {
    // Check if the quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Check if the student has already attempted the quiz
    const hasAttempted = quiz.students.some(
      (student) => student.studentId.toString() === studentId
    );

    res.json({ canAttempt: !hasAttempted });
  } catch (error) {
    console.error("Error checking quiz attempt:", error);
    res.status(500).json({ message: "Error checking quiz attempt" });
  }
});

app.get("/quiz-review/:quizId/:studentId", async (req, res) => {
  const { quizId, studentId } = req.params;

  try {
    // Validate studentId format
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid student ID format" });
    }

    // Find the quiz and populate questions
    const quiz = await Quiz.findById(quizId).populate("questions");

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Find the student's attempt using `.equals()`
    const studentAttempt = quiz.students.find((student) =>
      student.studentId.equals(studentId)
    );

    if (!studentAttempt) {
      return res.status(404).json({
        message: "No attempt found for this student",
      });
    }

    // Structure the response with quiz and student response data
    const quizReviewData = {
      title: quiz.title,
      subject: quiz.subject,
      questions: quiz.questions.map((question) => {
        // Find the student's response for this question
        const studentResponse = studentAttempt.responses.find(
          (response) =>
            response.questionId.toString() === question._id.toString()
        );

        return {
          _id: question._id,
          questionText: question.questionText,
          options: question.options,
          correctAnswer: question.correctAnswer,
          selectedOption: studentResponse
            ? studentResponse.selectedOption
            : null,
          isCorrect: studentResponse ? studentResponse.isCorrect : false,
        };
      }),
      studentName: studentAttempt.name,
      score: studentAttempt.score,
      totalQuestions: quiz.questions.length,
      attemptedOn: studentAttempt.time,
    };

    res.json(quizReviewData);
  } catch (error) {
    console.error(" Error fetching quiz for review:", error);
    res.status(500).json({
      message: "Error fetching quiz for review",
      error: error.message,
    });
  }
});

app.get("/my-quizzes/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    // Validate userId - very important!
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format." });
    }

    // Find quizzes created by the specified user
    const quizzes = await Quiz.find({ createdBy: userId }).sort({
      createdAt: -1,
    }); // Sort by creation date, newest first

    if (!quizzes || quizzes.length === 0) {
      return res
        .status(200)
        .json({ message: "No quizzes found for this user." }); // Return an empty array instead of an error
    }

    res.status(200).json(quizzes);
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    res.status(500).json({
      message: "Error fetching quizzes",
      error: error.message,
    });
  }
});

app.get("/attempted-quizzes/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Convert userId to ObjectId for MongoDB query
    const objectIdUserId = new mongoose.Types.ObjectId(userId);

    // Find quizzes where the student array contains the user ID
    const attemptedQuizzes = await Quiz.find({
      "students.studentId": objectIdUserId,
    }).select("title subject students questions");

    // Extract relevant information from the students array
    const extractedQuizzes = attemptedQuizzes.map((quiz) => {
      // Find the student's data within the quiz
      const student = quiz.students.find((s) =>
        s.studentId.equals(objectIdUserId)
      );
      const totalQuestions = quiz.questions?.length || 0;

      return {
        _id: quiz._id,
        title: quiz.title,
        subject: quiz.subject,
        time: student?.time || new Date(), // Default to current date if missing
        score: student?.score ?? 0, // Default to 0 if score is missing
        totalQuestions: totalQuestions,
      };
    });

    // If no quizzes are found, return a 404 with a message
    if (extractedQuizzes.length === 0) {
      return res.status(404).json({
        message: "No quizzes attempted by this user.",
      });
    }

    // Return the extracted quizzes
    res.status(200).json(extractedQuizzes);
  } catch (error) {
    console.error("Error fetching attempted quizzes:", error);
    res.status(500).json({
      message: "Error fetching attempted quizzes",
      error: error.message,
    });
  }
});

app.get("/quiz-results/:quizId", async (req, res) => {
  const { quizId } = req.params;

  try {
    // Fetch quiz with populated student details
    const quiz = await Quiz.findById(quizId)
      .populate({
        path: "students.studentId",
        select: "userName", // Fetch only the userName field
      })
      .lean();

    // Check if quiz exists
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Calculate the total number of questions
    const totalQuestions = quiz.questions.length;

    // Ensure students array exists
    if (!quiz.students || quiz.students.length === 0) {
      return res.json({
        quizId: quiz._id,
        title: quiz.title,
        subject: quiz.subject,
        totalQuestions: totalQuestions,
        attemptedOn: quiz.updatedAt,
        students: [],
        message: "No students have attempted this quiz yet.",
      });
    }

    // Sort students by score (descending) and handle missing student names
    const sortedResults = quiz.students
      .filter((student) => student.studentId) // Remove invalid students
      .sort((a, b) => b.score - a.score)
      .map((student) => ({
        studentId: student.studentId._id, // Ensure studentId exists
        name: student.studentId.userName || "Unknown", // Use name if available
        score: student.score,
        time: student.time, // Submission time
        totalQuestions: totalQuestions,
      }));

    res.json({
      quizId: quiz._id,
      title: quiz.title,
      subject: quiz.subject,
      totalQuestions: totalQuestions,
      attemptedOn: quiz.updatedAt,
      students: sortedResults,
    });
  } catch (error) {
    console.error(" Error fetching quiz results:", error);
    res.status(500).json({
      message: "Error fetching quiz results",
      error: error.message,
    });
  }
});

app.put("/quizzes/:quizId", async (req, res) => {
  try {
    // Update the quiz
    const updatedQuiz = await Quiz.findByIdAndUpdate(
      req.params.quizId,
      req.body,
      { new: true }
    );
    if (!updatedQuiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    res.json({ message: "Quiz updated successfully", updatedQuiz });
  } catch (error) {
    console.error("Error editing quiz:", error);
    res
      .status(500)
      .json({ message: "Error editing quiz", error: error.message });
  }
});

// delete quix
app.delete("/quizzes/:quizId", async (req, res) => {
  try {
    // Delete the quiz
    await Quiz.findByIdAndDelete(req.params.quizId);
    res.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    res
      .status(500)
      .json({ message: "Error deleting quiz", error: error.message });
  }
});

app.get("/quizzes/:quizId", async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    res.json(quiz);
  } catch (error) {
    console.error("Error fetching quiz:", error);
    res
      .status(500)
      .json({ message: "Error fetching quiz", error: error.message });
  }
});

// update from active to completed status every minute
const cron = require("node-cron");
cron.schedule("* * * * *", async () => {
  try {
    const currentDate = new Date();

    // Update quizzes that should be 'active'
    await Quiz.updateMany(
      {
        startDate: { $lte: currentDate },
        endDate: { $gte: currentDate },
        status: "draft",
      },
      { $set: { status: "active" } }
    );

    // Update quizzes that should be 'completed'
    await Quiz.updateMany(
      { endDate: { $lt: currentDate }, status: { $ne: "completed" } },
      { $set: { status: "completed" } }
    );
  } catch (error) {
    console.error("Error updating quiz statuses:", error);
  }
});
