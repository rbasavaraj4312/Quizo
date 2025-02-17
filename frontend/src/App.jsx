import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";

import Navbar from "./Components/Navbar/Navbar";
import Home from "./Components/Home/Home";
import Footer from "./Components/Footer/Footer";
import Login from "./Components/Login/Login";
import SignUp from "./Components/SignUp/SignUp";
import AddTeacher from "./Components/AddTeacher/AddTeacher";
import AllTeacher from "./Components/AllTeacher/AllTeacher";
import AddQuiz from "./Components/AddQuiz/AddQuiz";
import Attempt from "./Components/Attempt/Attempt";
import Attempted from "./Components/Attempted/Attempted";
import Review from "./Components/Attempted/Review";
import MyQuiz from "./Components/MyQuiz/MyQuiz";
import Results from "./Components/MyQuiz/Results";
import EditQuiz from "./Components/MyQuiz/EditQuiz";

function App() {
  const [userType, setUserType] = useState(
    localStorage.getItem("userType") || ""
  );
  const [loggedIn, setLoggedIn] = useState(
    localStorage.getItem("loggedIn") === "true"
  );
  const [userDetails, setUserDetails] = useState(
    JSON.parse(localStorage.getItem("userDetails")) || {}
  );

  const [server, setServer] = useState("https://quizo-15ql.onrender.com");

  // Sync local storage when state changes
  useEffect(() => {
    localStorage.setItem("userType", userType);
    localStorage.setItem("loggedIn", loggedIn);
    localStorage.setItem("userDetails", JSON.stringify(userDetails));
  }, [userType, loggedIn, userDetails]);

  // Logout function to clear local storage
  const handleLogout = () => {
    localStorage.removeItem("userType");
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("userDetails");
    setLoggedIn(false);
    setUserType("");
    setUserDetails({});
  };

  return (
    <>
      <Navbar
        loggedIn={loggedIn}
        userType={userType}
        setLoggedIn={setLoggedIn}
        setUserType={setUserType}
        setUserDetails={setUserDetails}
        handleLogout={handleLogout}
        server={server}
      />
      <Routes>
        <Route
          path="/login"
          element={
            <Login
              server={server}
              setLoggedIn={setLoggedIn}
              setUserType={setUserType}
              setUserDetails={setUserDetails}
            />
          }
        />
        <Route path="*" element={<Home loggedIn={loggedIn} server={server} userType={userType} />} />
        <Route
          path="/"
          element={
            <Home loggedIn={loggedIn} server={server} userType={userType} />
          }
        />
        <Route
          path="/signup"
          element={
            <SignUp
              setLoggedIn={setLoggedIn}
              setUserType={setUserType}
              setUserDetails={setUserDetails}
              server={server}
            />
          }
        />

        {userType === "student" && (
          <>
            <Route
              path="/"
              element={
                <Home loggedIn={loggedIn} server={server} userType={userType} />
              }
            />
            <Route
              path="/take-quiz"
              element={<Attempt userDetails={userDetails} server={server} />}
            />
            <Route
              path="/attempted"
              element={<Attempted userDetails={userDetails} server={server} />}
            />
            <Route
              path="/quiz-review/:quizId"
              element={<Review userDetails={userDetails} server={server} />}
            />
          </>
        )}
        {userType === "teacher" && (
          <>
            <Route
              path="/"
              element={
                <Home loggedIn={loggedIn} userType={userType} server={server} />
              }
            />
            <Route
              path="/add_quiz"
              element={<AddQuiz userDetails={userDetails} server={server} />}
            />
            <Route
              path="/myQuiz"
              element={<MyQuiz userDetails={userDetails} server={server} />}
            />
            <Route
              path="/check-results/:quizId"
              element={<Results server={server} />}
            />
            <Route
              path="/edit-quiz/:quizId"
              element={<EditQuiz userDetails={userDetails} server={server} />}
            />
          </>
        )}
        {userType === "admin" && (
          <>
            <Route
              path="/add_teacher"
              element={<AddTeacher server={server} />}
            />
            <Route
              path="/all-teacher"
              element={<AllTeacher server={server} />}
            />
          </>
        )}
      </Routes>
      <Footer />
    </>
  );
}

export default App;
