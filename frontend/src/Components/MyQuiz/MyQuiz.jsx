import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

const MyQuiz = ({ userDetails, server }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyQuizzes = async () => {
      try {
        setLoading(true);
        setError("");

        if (!userDetails || !userDetails._id) {
          console.error("User details or user ID is missing.");
          setError("User details are missing. Please log in again.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${server}/my-quizzes/${userDetails._id}`
        );

        if (
          !Array.isArray(response.data) &&
          !(
            typeof response.data === "object" &&
            response.data !== null &&
            response.data.message === "No quizzes found for this user."
          )
        ) {
          console.error("Invalid quiz data received:", response.data);
          setError("Failed to load quizzes. Invalid data format.");
          setQuizzes([]);
          setLoading(false);
          return;
        }

        if (
          typeof response.data === "object" &&
          response.data !== null &&
          response.data.message === "No quizzes found for this user."
        ) {
          setQuizzes([]);
          setLoading(false);
          return;
        }

        setQuizzes(response.data);
      } catch (err) {
        console.error("Error fetching quizzes:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to fetch quizzes. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMyQuizzes();
  }, [userDetails]);

  const handleEditQuiz = (quizId) => {
    // Ensure quizId is valid before navigating
    if (!quizId) {
      console.error("Invalid quiz ID for editing.");
      setError("Cannot edit quiz. Invalid quiz ID.");
      return;
    }
    navigate(`/edit-quiz/${quizId}`);
  };

  const handleDeleteQuiz = async (quizId) => {
    // Ensure quizId is valid before attempting to delete
    if (!quizId) {
      console.error("Invalid quiz ID for deletion.");
      setError("Cannot delete quiz. Invalid quiz ID.");
      return;
    }

    try {
      // Confirm with the user before deleting
      if (window.confirm("Are you sure you want to delete this quiz?")) {
        await axios.delete(`${server}/quizzes/${quizId}`);
        // Refresh the quiz list after successful deletion
        setQuizzes((prevQuizzes) =>
          prevQuizzes.filter((quiz) => quiz._id !== quizId)
        );
      }
    } catch (err) {
      console.error("Error deleting quiz:", err);
      setError(
        err.response?.data?.message ||
          err.message || // Use the direct error message if available
          "Failed to delete quiz. Please try again."
      );
    }
  };

  const isQuizEditable = (quiz) => {
    // Add a null check to ensure quiz and quiz.startDate exist
    if (!quiz || !quiz.startDate) {
      return false; // If quiz or startDate is null, the quiz isn't editable
    }
    // Check if the quiz has started based on startDate
    return new Date(quiz.startDate) > new Date();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-gray-600 text-lg font-medium animate-pulse">
          Loading your quizzes...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-red-500 text-lg font-semibold">Error: {error}</div>
      </div>
    );
  }

  if (!quizzes || quizzes.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-gray-600 text-lg font-medium">
          You have not posted any quizzes yet.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-10 text-center">
          My Quizzes
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div
              key={quiz._id}
              className="bg-white rounded-xl shadow-md overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-lg p-6 relative">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {quiz.title}
              </h2>
              <p className="text-gray-700 mb-4">Subject: {quiz.subject}</p>
              <p className="text-gray-600 mb-2">
                Created On: {new Date(quiz.createdAt).toLocaleDateString()}
              </p>
              <button
                onClick={() => {
                  navigate(`/check-results/${quiz._id}`);
                }}
                className="mt-auto w-full px-4 py-2 text-lg font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring focus:ring-blue-300">
                Check results
              </button>

              {/* Edit and Delete Icons (Conditionally Rendered) */}
              {isQuizEditable(quiz) && (
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    onClick={() => handleEditQuiz(quiz._id)}
                    className="text-blue-500 hover:text-blue-700 focus:outline-none">
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    onClick={() => handleDeleteQuiz(quiz._id)}
                    className="text-red-500 hover:text-red-700 focus:outline-none">
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyQuiz;
