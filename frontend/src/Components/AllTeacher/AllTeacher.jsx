import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiTrash2, FiSearch } from "react-icons/fi";

const AllTeacher = ({ server }) => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${server}/teachers`);
      setTeachers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      alert("Failed to fetch teachers");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTeacher = async (id) => {
    if (!window.confirm("Are you sure you want to delete this teacher?"))
      return;
    try {
      await axios.delete(`${server}/teachers/${id}`);
      setTeachers(teachers.filter((teacher) => teacher._id !== id));
      alert("Teacher deleted successfully");
    } catch (error) {
      alert("Failed to delete teacher");
    }
  };

  // Filter teachers based on search term
  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <FiSearch
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : filteredTeachers.length === 0 ? (
        <div className="text-center text-gray-500 text-lg">
          No teachers found.
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTeachers.map((teacher) => (
            <div
              key={teacher._id}
              className="bg-white shadow-lg rounded-lg p-5 flex justify-between items-center border border-gray-200 hover:shadow-xl transition">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 capitalize">
                  {teacher.userName}
                </h3>
                <p className="text-sm text-gray-500">{teacher.email}</p>
              </div>
              <button
                onClick={() => deleteTeacher(teacher._id)}
                className="px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition flex items-center gap-2">
                <FiTrash2 size={16} /> Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllTeacher;
