import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Home = ({ loggedIn, userType, server }) => {
  const [liveQuizzes, setLiveQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchLiveQuizzes = async () => {
      try {
        const response = await axios.get(`${server}/live-quizzes`);
        setLiveQuizzes(response.data);
      } catch (error) {
        console.error("Error fetching live quizzes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveQuizzes();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex items-center gap-2 text-gray-600 text-lg font-medium">
          <div className="animate-spin border-t-4 border-blue-500 border-solid rounded-full h-6 w-6"></div>
          Loading Live quizzes...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-semibold text-center mb-6">Live Quizzes</h2>

      {loading ? (
        <p className="text-center">Loading quizzes...</p>
      ) : liveQuizzes.length === 0 ? (
        <p className="text-center">No live quizzes available.</p>
      ) : (
        <div className="grid gap-4">
          {liveQuizzes.map((quiz) => (
            <div key={quiz._id} className="p-4 bg-white rounded-lg shadow-xl">
              <div className="flex ">
                <h3 className="text-lg font-semibold capitalize">
                  {quiz.title}
                </h3>
                <h3 className="text-lg font-semibold capitalize ml-auto">
                  - {quiz.createdBy?.userName || "Unknown"}
                </h3>
              </div>
              <p className="text-sm text-gray-600">Subject: {quiz.subject}</p>
              <p className="text-sm text-gray-600">
                Ends At: {new Date(quiz.endDate).toLocaleString()}
              </p>
              {(userType === "student" || userType === "") && (
                <button
                  className="mt-4 w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-full hover:bg-blue-600"
                  onClick={() => {
                    if (loggedIn) {
                      navigate(`/take-quiz`, { state: { quiz } });
                    } else {
                      navigate(`/login`);
                    }
                  }}>
                  Take Quiz
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
