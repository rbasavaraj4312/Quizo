import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Calendar } from "lucide-react";

const EditQuiz = ({ userDetails, server }) => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [marksPerQuestion, setMarksPerQuestion] = useState(1);
  const [negativeMarking, setNegativeMarking] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [duration, setDuration] = useState(60);
  const [unidirectional, setUnidirectional] = useState(false);
  const [questions, setQuestions] = useState([
    { questionText: "", options: ["", "", "", ""], correctAnswer: "" },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        setError("");

        if (!quizId) {
          console.error("Quiz ID is undefined. Cannot fetch results.");
          setError("Quiz ID is missing. Please check the URL.");
          setLoading(false);
          return;
        }

        const response = await axios.get(`${server}/quizzes/${quizId}`);

        if (!response || !response.data) {
          throw new Error("Invalid response from server. No data received.");
        }

        const quizData = response.data;

        setTitle(quizData.title || "");
        setSubject(quizData.subject || "");
        setMarksPerQuestion(quizData.marksPerQuestion || 1);
        setNegativeMarking(quizData.negativeMarking || false);
        setStartDate(quizData.startDate || "");
        setEndDate(quizData.endDate || "");
        setDuration(quizData.duration || 60);
        setUnidirectional(quizData.unidirectional || false);
        setQuestions(
          quizData.questions || [
            { questionText: "", options: ["", "", "", ""], correctAnswer: "" },
          ]
        );
      } catch (error) {
        console.error("Error fetching quiz:", error);
        setError(
          error.response?.data?.message ||
            error.message || // Use the direct error message if available
            "Failed to fetch quiz data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [quizId]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { questionText: "", options: ["", "", "", ""], correctAnswer: "" },
    ]);
  };

  const handleRemoveQuestion = (index) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!title || !subject || !startDate || !endDate || !duration) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setError("Start date must be before end date.");
      setLoading(false);
      return;
    }

    const quizData = {
      createdBy: userDetails._id,
      title,
      subject,
      marksPerQuestion,
      negativeMarking,
      startDate,
      endDate,
      duration,
      unidirectional,
      questions,
    };

    try {
      const response = await axios.put(`${server}/quizzes/${quizId}`, quizData);

      if (response.status !== 200 && response.status !== 201) {
        throw new Error(
          `Failed to update quiz. Server responded with status: ${response.status}`
        );
      }

      alert("Quiz updated successfully!");
      setLoading(false);
      navigate(`/my-quizzes/${userDetails._id}`);
    } catch (error) {
      console.error("Error updating quiz:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to update quiz. Please try again."
      );
      setLoading(false);
    }
    navigate("/");
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-semibold text-center mb-6">Edit Quiz</h2>
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700">
                  Quiz Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter quiz title"
                  required
                  className="mt-1 w-full p-3 border rounded-md focus:ring focus:ring-blue-300 shadow-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter subject"
                  required
                  className="mt-1 w-full p-3 border rounded-md focus:ring focus:ring-blue-300 shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Quiz Settings</h3>
              <div>
                <label
                  htmlFor="marksPerQuestion"
                  className="block text-sm font-medium text-gray-700">
                  Marks Per Question
                </label>
                <input
                  type="number"
                  id="marksPerQuestion"
                  value={marksPerQuestion}
                  min="1"
                  onChange={(e) => setMarksPerQuestion(Number(e.target.value))}
                  placeholder="Enter marks per question"
                  required
                  className="mt-1 w-full p-3 border rounded-md focus:ring focus:ring-blue-300 shadow-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="duration"
                  className="block text-sm font-medium text-gray-700">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  id="duration"
                  value={duration}
                  min="1"
                  onChange={(e) => setDuration(Number(e.target.value))}
                  placeholder="Enter duration in minutes"
                  required
                  className="mt-1 w-full p-3 border rounded-md focus:ring focus:ring-blue-300 shadow-sm"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Negative Marking
                </span>
                <button
                  type="button"
                  onClick={() => setNegativeMarking(!negativeMarking)}
                  className={`relative inline-flex h-6 w-12 items-center rounded-full transition-all ${
                    negativeMarking ? "bg-blue-600" : "bg-gray-300"
                  }`}>
                  <span
                    className={`inline-block h-4 w-4 transform bg-white rounded-full transition-transform ${
                      negativeMarking ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Unidirectional
                </span>
                <button
                  type="button"
                  onClick={() => setUnidirectional(!unidirectional)}
                  className={`relative inline-flex h-6 w-12 items-center rounded-full transition-all ${
                    unidirectional ? "bg-blue-600" : "bg-gray-300"
                  }`}>
                  <span
                    className={`inline-block h-4 w-4 transform bg-white rounded-full transition-transform ${
                      unidirectional ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Schedule Section */}
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold">Schedule</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="datetime-local"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="mt-1 w-full p-3 border rounded-md focus:ring focus:ring-blue-300 shadow-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="datetime-local"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="mt-1 w-full p-3 border rounded-md focus:ring focus:ring-blue-300 shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Questions Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Questions</h3>
            {questions.map((question, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow p-4 mb-4 relative">
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-6 h-6">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <div>
                  <label
                    htmlFor={`questionText-${index}`}
                    className="block text-sm font-medium text-gray-700">
                    Question {index + 1}
                  </label>
                  <input
                    type="text"
                    id={`questionText-${index}`}
                    value={question.questionText}
                    onChange={(e) =>
                      handleQuestionChange(
                        index,
                        "questionText",
                        e.target.value
                      )
                    }
                    placeholder="Enter your question"
                    className="mt-1 w-full p-3 border rounded-md focus:ring focus:ring-blue-300 shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {String.fromCharCode(65 + optionIndex)}.
                      </span>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) =>
                          handleOptionChange(index, optionIndex, e.target.value)
                        }
                        placeholder={`Option ${optionIndex + 1}`}
                        className="flex-1 p-3 border rounded-md focus:ring focus:ring-blue-300 shadow-sm"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label
                    htmlFor={`correctAnswer-${index}`}
                    className="block text-sm font-medium text-gray-700 mt-3">
                    Correct Answer
                  </label>
                  <select
                    id={`correctAnswer-${index}`}
                    value={question.correctAnswer}
                    onChange={(e) =>
                      handleQuestionChange(
                        index,
                        "correctAnswer",
                        e.target.value
                      )
                    }
                    className="mt-1 w-full p-3 border rounded-md focus:ring focus:ring-blue-300 shadow-sm">
                    <option value="">Select Correct Answer</option>
                    {question.options.map((option, optionIndex) => (
                      <option key={optionIndex} value={option}>
                        {option || `Option ${optionIndex + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
            <div className="flex justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all focus:ring focus:ring-green-300"
                onClick={handleAddQuestion}>
                Add Question
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="border-t border-gray-200 pt-6 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all focus:ring focus:ring-blue-300"
              disabled={loading}>
              {loading ? "Updating..." : "Update Quiz"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditQuiz;
