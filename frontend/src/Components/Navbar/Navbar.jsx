import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Logo from "../../../logo.svg";

const Navbar = ({
  loggedIn,
  userType,
  setLoggedIn,
  setUserType,
  setUserDetails,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = {
    "": [{ name: "Home", path: "/" }],
    student: [
      { name: "Home", path: "/" },
      { name: "Attempted", path: "/attempted" },
    ],
    teacher: [
      { name: "Home", path: "/" },
      { name: "Add Quiz", path: "/add_quiz" },
      { name: "My Quizzes", path: "/myQuiz" },
    ],
    admin: [
      { name: "All Teachers", path: "/all-teacher" },
      { name: "Add Teacher", path: "/add_teacher" },
    ],
  };

  return (
    <nav className="bg-white border-gray-200 dark:bg-gray-900 shadow-md">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <img src={Logo} className="h-8" alt="Quizo Logo" />
          <span className="self-center text-2xl font-semibold dark:text-white">
            QUIZO
          </span>
        </a>

        <div className="flex md:order-2 space-x-3">
          <button
            onClick={() => {
              if (loggedIn) {
                navigate("/");
                setLoggedIn(false);
                setUserType("");
                setUserDetails({});
              } else {
                navigate("/login");
              }
            }}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
            {loggedIn ? "Logout" : "Login"}
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14">
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
        </div>

        <div
          className={`${
            isOpen ? "block" : "hidden"
          } w-full md:flex md:w-auto md:order-1`}>
          <ul className="flex flex-col md:flex-row md:space-x-8">
            {navItems[userType]?.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `block py-2 px-3 md:p-0 rounded-sm ${
                      isActive
                        ? "text-blue-700 font-semibold"
                        : "text-gray-900 hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700"
                    }`
                  }>
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
