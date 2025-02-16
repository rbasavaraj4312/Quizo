import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const Results = ({ server }) => {
  const { quizId } = useParams();
  const [studentResults, setStudentResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(0);

  useEffect(() => {
    const fetchStudentResults = async () => {
      // Handle undefined quizId
      if (!quizId) {
        console.error("Quiz ID is undefined. Cannot fetch results.");
        setError("Quiz ID is missing. Please check the URL.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${server}/quiz-results/${quizId}`);

        // Check if the response is successful and has data
        if (!response || !response.data) {
          throw new Error("Invalid response from server. No data received.");
        }

        // Check if the students array exists
        if (!response.data.students || !Array.isArray(response.data.students)) {
          console.warn("No student results found or invalid data format.");
          setStudentResults([]); // Set to empty array to avoid rendering issues
          setTotalQuestions(response.data.totalQuestions || 0);
          setError("No student results found for this quiz.");
          setLoading(false);
          return;
        }
        setStudentResults(response.data.students);
        setTotalQuestions(response.data.totalQuestions);
      } catch (err) {
        console.error("Error fetching student results:", err);
        setError(
          err.response?.data?.message ||
            err.message || // Use the direct error message if available
            "Failed to fetch student results. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudentResults();
  }, [quizId]);

  const getScoreClass = (score) => {
    if (score > 0.7 * totalQuestions) return "bg-green-200 text-green-800";
    if (score > 0.4 * totalQuestions) return "bg-yellow-200 text-yellow-800";
    return "bg-red-200 text-red-800";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-gray-600 text-lg font-medium animate-pulse">
          Loading student results...
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

  if (!studentResults || studentResults.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-gray-600 text-lg font-medium">
          No students have attempted this quiz yet.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-10 text-center">
          Quiz Results
        </h1>
        <div className="overflow-hidden rounded-lg shadow-lg bg-white">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-gray-700 uppercase text-sm font-semibold tracking-wide">
                <th className="px-6 py-3 text-left">Student Name</th>
                <th className="px-6 py-3 text-left">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {studentResults.map((result, index) => (
                <tr
                  key={result.studentId}
                  className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                  <td className="px-6 py-4 text-gray-900 font-medium capitalize">
                    {result.name}
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreClass(
                        result.score
                      )}`}>
                      {result.score} / {totalQuestions}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Results;
