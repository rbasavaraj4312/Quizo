import React, { useState } from "react";
import Logo from "../../../logo.svg";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";

const SignUp = ({ setLoggedIn, setUserType, setUserDetails, server }) => {
  const [Details, setDetails] = useState({
    userType: "",
    userName: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${server}/signup`, {
        ...Details,
      });

      setDetails({
        userType: "",
        userName: "",
        email: "",
        password: "",
      });
      alert("Signed Up successfully");
      setUserType(Details.userType);
      setUserDetails(Details);
      setLoggedIn(true);
      navigate("/");
    } catch (error) {
      console.error("There was an error in signup post:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDetails({
      ...Details,
      [name]: value,
    });
  };

  return (
    <div>
      <section className="bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <a
            href="#"
            className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
            <img className="w-8 h-8 mr-2" src={Logo} alt="logo" />
            Quizo
          </a>
          <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                Create an account
              </h1>
              <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                <div className="flex items-center mb-4">
                  <input
                    id="userTypeStudent"
                    type="radio"
                    name="userType"
                    value="student"
                    checked={Details.userType === "student"}
                    onChange={handleChange}
                    required
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label
                    htmlFor="userTypeStudent"
                    className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                    Student ( Attempt quiz )
                  </label>
                </div>
                <div className="flex items-center mb-4">
                  <input
                    id="userTypeTeacher"
                    type="radio"
                    name="userType"
                    value="teacher"
                    checked={Details.userType === "teacher"}
                    onChange={handleChange}
                    required
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label
                    htmlFor="userTypeTeacher"
                    className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                    Teacher ( Conduct quiz )
                  </label>
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Your email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="name@company.com"
                    required=""
                    value={Details.email}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    htmlFor="userName"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Your user name :
                  </label>
                  <input
                    type="text"
                    name="userName"
                    id="userName"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Enter your user name"
                    required=""
                    value={Details.userName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="••••••••"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    required=""
                    value={Details.password}
                    onChange={handleChange}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                  Create an account
                </button>
                <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                  Already have an account?{" "}
                  <button
    onClick={() => navigate("/login")}
    className="font-medium text-blue-600 hover:underline dark:text-blue-500"
  >
    Login here
  </button>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SignUp;
