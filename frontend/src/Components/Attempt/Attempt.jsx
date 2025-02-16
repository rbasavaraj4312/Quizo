import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaSpinner } from "react-icons/fa";

const Attempt = ({ userDetails, server }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const quiz = location.state?.quiz;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmittingOnUnmount, setIsSubmittingOnUnmount] = useState(false);
  const [canAttempt, setCanAttempt] = useState(null);
  const [attemptError, setAttemptError] = useState(null);

  // Refs to hold the latest state values
  const submittedRef = useRef(submitted);
  const loadingRef = useRef(loading);
  const selectedAnswersRef = useRef(selectedAnswers);
  const studentIdRef = useRef(null);
  const timerIntervalRef = useRef(null); // Ref to store the interval ID

  useEffect(() => {
    submittedRef.current = submitted;
    loadingRef.current = loading;
    selectedAnswersRef.current = selectedAnswers;
  }, [submitted, loading, selectedAnswers]);

  // Check if the user can attempt the quiz
  const checkAttempt = useCallback(async () => {
    if (!quiz || !userDetails) return;

    const studentId = userDetails?._id || "anonymous_" + Date.now();
    studentIdRef.current = studentId;

    try {
      const response = await axios.get(
        `${server}/check-quiz-attempt?quizId=${quiz._id}&studentId=${studentId}`
      );
      setCanAttempt(response.data.canAttempt);
    } catch (error) {
      console.error("Error checking quiz attempt:", error);
      if (error.response?.status === 404) {
        setAttemptError("Quiz attempt check endpoint not found.");
      } else {
        setAttemptError(
          error.response?.data?.message || "Failed to check quiz attempt."
        );
      }
      setCanAttempt(false);
    }
  }, [quiz, userDetails]);

  useEffect(() => {
    checkAttempt();
  }, [checkAttempt]);

  // Handle quiz submission
  const handleSubmit = useCallback(async () => {
    if (submittedRef.current || loadingRef.current || !canAttempt) return; // Prevent multiple submissions

    setIsSubmittingOnUnmount(true);
    setLoading(true);

    const studentId = studentIdRef.current;
    const studentName = userDetails?.userName || "Anonymous";

    const requestData = {
      quizId: quiz._id,
      studentId,
      name: studentName,
      answers: selectedAnswersRef.current,
      score: calculateScore(selectedAnswersRef.current),
    };

    try {
      await axios.post(`${server}/submit-quiz`, requestData);
      setScore(calculateScore(selectedAnswersRef.current));
      setSubmitted(true);
      submittedRef.current = true; // ✅ Mark as submitted

      // ✅ Stop timer when submitted
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    } catch (error) {
      console.error("Error submitting quiz:", error.response?.data || error);
    } finally {
      setLoading(false);
      setIsSubmittingOnUnmount(false);
    }
  }, [quiz, userDetails?.userName, canAttempt]);

  // Timer setup
  useEffect(() => {
    if (quiz && canAttempt === true) {
      setTimeLeft(quiz.duration * 60);

      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerIntervalRef.current); // ✅ Stop the timer

            // ✅ Check if already submitted before submitting
            if (!submittedRef.current) {
              handleSubmit();
            }

            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current); // ✅ Clear interval on unmount
      }
    };
  }, [quiz, canAttempt, handleSubmit]);

  // Clear the interval when the quiz is submitted manually
  useEffect(() => {
    if (submitted && timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  }, [submitted]);

  // Handle page exit (tab close, refresh, etc.)
  useEffect(() => {
    const handlePageExit = () => {
      if (!submittedRef.current && !loadingRef.current && canAttempt) {
        console.log("Page exit detected. Attempting to submit quiz...");
        performSyncSubmit();
      }
    };

    const handleBeforeUnload = (event) => {
      handlePageExit();
      event.preventDefault();
      event.returnValue =
        "Are you sure you want to leave? Your quiz will be submitted.";
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        console.log("Tab switched or minimized. Attempting to submit quiz...");
        handlePageExit();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageExit);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageExit);
    };
  }, [canAttempt]);

  // Synchronous submission function
  const performSyncSubmit = () => {
    if (isSubmittingOnUnmount || submittedRef.current) {
      console.log("Submission already in progress or quiz already submitted.");
      return;
    }
    setIsSubmittingOnUnmount(true);

    const studentId = studentIdRef.current;
    const studentName = userDetails?.userName || "Anonymous";

    const requestData = JSON.stringify({
      quizId: quiz._id,
      studentId,
      name: studentName,
      answers: selectedAnswersRef.current,
      score: calculateScore(selectedAnswersRef.current),
    });

    const endpoint = `${server}/submit-quiz`;

    console.log("Attempting to submit quiz synchronously...");

    // Try fetch with keepalive first
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: requestData,
      keepalive: true, // Ensure the request continues even if the page is closed
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        console.log("✅ Quiz submitted via fetch() with keepalive");
      })
      .catch((error) => {
        console.warn(
          "⚠️ fetch() with keepalive failed, falling back to sendBeacon...",
          error
        );

        // Fallback to sendBeacon
        const blob = new Blob([requestData], { type: "application/json" });
        const success = navigator.sendBeacon(endpoint, blob);
        if (!success) {
          console.error("❌ sendBeacon also failed");
          throw new Error("Both fetch and sendBeacon failed");
        }
        console.log("📡 Quiz submitted via sendBeacon()");
      })
      .finally(() => {
        setIsSubmittingOnUnmount(false);
      });
  };

  // Calculate the score based on selected answers
  const calculateScore = (answers) => {
    return quiz.questions.reduce((score, question) => {
      return score + (answers[question._id] === question.correctAnswer ? 1 : 0);
    }, 0);
  };

  // Conditional rendering based on quiz, attempt status, etc.
  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 text-lg font-semibold">
          Quiz data not found!
        </p>
        <button
          className="mt-4 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition duration-200"
          onClick={() => navigate("/")}>
          Go Back
        </button>
      </div>
    );
  }

  if (attemptError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 text-lg font-semibold">{attemptError}</p>
        <button
          className="mt-4 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition duration-200"
          onClick={() => navigate("/")}>
          Go Back
        </button>
      </div>
    );
  }

  if (canAttempt === false) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 text-lg font-semibold">
          You have already attempted this quiz.
        </p>
        <button
          className="mt-4 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition duration-200"
          onClick={() => navigate("/")}>
          Go Back
        </button>
      </div>
    );
  }

  if (canAttempt === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600 text-lg">Checking quiz attempt...</p>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleAnswerSelection = (option) => {
    setSelectedAnswers({ ...selectedAnswers, [currentQuestion._id]: option });
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const QuestionCard = ({ question, selectedAnswer, onAnswerSelect }) => {
    return (
      <div className="bg-gray-50 p-6 rounded-lg shadow-md transition-transform transform hover:scale-105">
        <h3 className="text-xl font-semibold text-gray-800">
          {question.questionText}
        </h3>
        <div className="mt-4 space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => onAnswerSelect(option)}
              className={`block w-full p-3 rounded-lg shadow-md text-left font-medium transition ${
                selectedAnswer === option
                  ? "bg-blue-500 text-white animate-pulse"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}>
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const ProgressBar = ({ progress }) => {
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        <div
          className="bg-blue-500 h-2.5 rounded-full"
          style={{ width: `${progress}%` }}></div>
      </div>
    );
  };

  const Timer = ({ timeLeft }) => {
    return (
      <div className="mt-4 mb-6 flex items-center justify-center">
        <div className="px-6 py-2 bg-gradient-to-r from-green-400 to-blue-500 text-white text-lg font-semibold rounded-lg shadow-md">
          Time Left: {Math.floor(timeLeft / 60)}:
          {(timeLeft % 60).toString().padStart(2, "0")}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
      <div className="w-full max-w-3xl bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-800">
          {quiz.title}
        </h2>

        <Timer timeLeft={timeLeft} />
        <ProgressBar progress={progress} />

        <p className="text-sm text-gray-500 mb-6 text-center">
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </p>

        {!submitted ? (
          <>
            <QuestionCard
              question={currentQuestion}
              selectedAnswer={selectedAnswers[currentQuestion._id]}
              onAnswerSelect={handleAnswerSelection}
            />
            <div className="flex justify-between mt-6">
              {!quiz.unidirectional && (
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className="px-5 py-2 bg-gray-300 text-gray-700 font-medium rounded-lg shadow-sm disabled:opacity-50 hover:bg-gray-400 transition">
                  Previous
                </button>
              )}
              {currentQuestionIndex === quiz.questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`px-6 py-2 text-white font-medium rounded-lg shadow-md transition flex items-center justify-center ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}>
                  {loading ? (
                    <FaSpinner className="animate-spin mr-2" />
                  ) : (
                    "Submit"
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-5 py-2 bg-gray-300 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-400 transition">
                  Next
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="mt-6 text-center">
            <h3 className="text-2xl font-bold text-green-600">
              Quiz Completed!
            </h3>
            <p className="text-lg font-medium text-gray-700">
              Your Score:{" "}
              <span className="text-blue-600 font-bold">{score}</span> /{" "}
              {quiz.questions.length}
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition">
              Back to home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attempt;
