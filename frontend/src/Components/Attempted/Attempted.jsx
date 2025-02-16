import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Attempted = ({ userDetails, server }) => {
  const [attemptedQuizzes, setAttemptedQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!userDetails || !userDetails._id) {
      setError("User data is missing. Please log in again.");
      setLoading(false);
      return;
    }

    const fetchAttemptedQuizzes = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await axios.get(
          `${server}/attempted-quizzes/${userDetails._id}`
        );

        if (!response.data || response.data.length === 0) {
          setError("You haven't attempted any quizzes yet.");
          return;
        }

        setAttemptedQuizzes(response.data);
      } catch (err) {
        console.error("Error fetching attempted quizzes:", err);
        setError(
          err.response?.data?.message ||
            "Failed to fetch attempted quizzes. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAttemptedQuizzes();
  }, [userDetails]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  // Retry function for error state
  const handleRetry = () => {
    setError("");
    setLoading(true);
    fetchAttemptedQuizzes();
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex items-center gap-2 text-gray-600 text-lg font-medium">
          <div className="animate-spin border-t-4 border-blue-500 border-solid rounded-full h-6 w-6"></div>
          Loading attempted quizzes...
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <div className="text-red-500 text-lg font-semibold">{error}</div>
        <div className="mt-4 flex gap-4">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
            Back to Home
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

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-10 text-center">
          My Attempted Quizzes
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {attemptedQuizzes.map((quiz) => (
            <div
              key={quiz._id}
              className="bg-white rounded-xl shadow-md overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-lg">
              <div className="p-6 flex flex-col h-full">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  {quiz.title || "Untitled Quiz"}
                </h2>
                <p className="text-gray-700 font-medium mb-4">
                  Subject: {quiz.subject || "N/A"}
                </p>
                <div className="flex items-center justify-between mt-auto text-gray-600">
                  <span className="font-semibold">
                    Score:{" "}
                    <span className="text-blue-600">
                      {quiz.score !== undefined ? quiz.score : "N/A"} /{" "}
                      {quiz.totalQuestions || "N/A"}
                    </span>
                  </span>
                  <span className="text-sm">{formatDate(quiz.time)}</span>
                </div>
                <button
                  onClick={() =>
                    quiz._id ? navigate(`/quiz-review/${quiz._id}`) : null
                  }
                  disabled={!quiz._id}
                  aria-label={quiz._id ? "Review Quiz" : "Review Unavailable"}
                  className={`mt-4 w-full px-4 py-3 text-lg font-semibold text-white rounded-lg shadow-md transition duration-300 focus:outline-none ${
                    quiz._id
                      ? "bg-blue-600 hover:bg-blue-700 focus:ring focus:ring-blue-300"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}>
                  {quiz._id ? "Review Quiz" : "Review Unavailable"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Attempted;
