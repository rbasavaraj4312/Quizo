import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/20/solid";

const Review = ({ userDetails, server }) => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!quizId || !userDetails?._id) {
      setError("Invalid quiz or user data. Please try again.");
      setLoading(false);
      return;
    }

    const fetchQuizData = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await axios.get(
          `${server}/quiz-review/${quizId}/${userDetails._id}`
        );
        setQuizData(response.data);
      } catch (err) {
        console.error("Error fetching quiz review data:", err);
        setError(
          err.response?.data?.message ||
            "Failed to fetch quiz review data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [quizId, userDetails?._id]);

  // Retry function for error state
  const handleRetry = () => {
    setError("");
    setLoading(true);
    fetchQuizData();
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex items-center gap-2 text-gray-600 text-lg font-medium">
          <div className="animate-spin border-t-4 border-blue-500 border-solid rounded-full h-6 w-6"></div>
          Loading quiz review...
        </div>
      </div>
    );
  }

  // Show error message if API request fails
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <div className="text-red-500 text-lg font-semibold">{error}</div>
        <div className="mt-4 flex gap-4">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
            Go Back
          </button>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show message if quiz data is not found
  if (!quizData) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-gray-600 text-lg font-medium">
          Quiz review data not found.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-6 text-center">
          Quiz Review
        </h1>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            {quizData.title || "Untitled Quiz"}
          </h2>
          <p className="text-gray-700 text-lg mb-4">
            <span className="font-medium">Subject:</span>{" "}
            {quizData.subject || "N/A"}
          </p>
          <p className="text-gray-700 text-lg">
            <span className="font-medium">Score:</span> {quizData.score} /{" "}
            {quizData.totalQuestions}
          </p>
          <p className="text-gray-700 text-lg mb-6">
            <span className="font-medium">Attempted On:</span>{" "}
            {formatDate(quizData.attemptedOn)}
          </p>

          {/* Questions */}
          {quizData.questions && quizData.questions.length > 0 ? (
            quizData.questions.map((question, index) => (
              <div
                key={index}
                className="mb-8 p-6 border border-gray-200 rounded-lg shadow-sm transition-transform transform hover:scale-[1.02] bg-white">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  {index + 1}.{" "}
                  {question.questionText || "Question not available"}
                </h3>
                <ul className="list-none pl-0 space-y-3">
                  {question.options && question.options.length > 0 ? (
                    question.options.map((option, optionIndex) => {
                      const isCorrectAnswer = option === question.correctAnswer;
                      const isUserSelected = option === question.selectedOption;
                      const isUserCorrect =
                        isUserSelected && question.isCorrect;

                      return (
                        <li
                          key={optionIndex}
                          className={`p-3 rounded-md text-lg font-medium border transition-all
                                  ${
                                    isCorrectAnswer
                                      ? "bg-green-100 border-green-400 text-green-700"
                                      : isUserSelected
                                      ? isUserCorrect
                                        ? "bg-green-100 border-green-400 text-green-700"
                                        : "bg-red-100 border-red-400 text-red-700"
                                      : "border-gray-300 hover:bg-gray-100"
                                  }`}>
                          {option}

                          {/* ✅ Show Correct Answer (Always) */}
                          {isCorrectAnswer && (
                            <span className="text-green-600 font-semibold ml-2">
                              (Correct Answer)
                            </span>
                          )}

                          {/* ✅ Show User's Selected Answer */}
                          {isUserSelected && (
                            <>
                              {isUserCorrect ? (
                                <XCircleIcon
                                  className="h-5 w-5 text-red-500 inline-block ml-2"
                                  aria-label="Incorrect Answer"
                                />
                              ) : (
                                <CheckCircleIcon
                                  className="h-5 w-5 text-green-500 inline-block ml-2"
                                  aria-label="Correct Answer"
                                />
                              )}
                              <span className="ml-2 text-sm text-gray-500 italic">
                                (Your Answer)
                              </span>
                            </>
                          )}
                        </li>
                      );
                    })
                  ) : (
                    <li className="text-gray-500">No options available</li>
                  )}
                </ul>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No questions available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Review;
