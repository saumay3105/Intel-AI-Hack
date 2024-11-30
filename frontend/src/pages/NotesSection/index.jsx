import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { PlusCircle, Trash2, ChevronRight } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

const NoteSections = () => {
  const [sections, setSections] = useState([]);
  const [newSection, setNewSection] = useState({ title: "", description: "" });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const axiosAuth = axios.create({
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('my-app-auth')}`,
      'Content-Type': 'application/json',
    }
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchSections();
  }, [user, navigate]);

  const fetchSections = async () => {
    try {
      const response = await axiosAuth.get('http://127.0.0.1:8000/note-sections/');
      setSections(response.data);
      setError("");
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError("Failed to fetch sections. Please try again later.");
      }
      console.error("Error fetching sections:", error);
    }
  };

  const createSection = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosAuth.post('http://127.0.0.1:8000/note-sections/', newSection);
      setSections([...sections, response.data]);
      setNewSection({ title: "", description: "" });
      setIsCreating(false);
      setError("");
    } catch (error) {
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError("Failed to create section. Please try again.");
      }
      console.error("Error creating section:", error);
    }
  };

  const deleteSection = async (id) => {
    if (window.confirm("Are you sure you want to delete this section and all its notes?")) {
      try {
        await axiosAuth.delete(`http://127.0.0.1:8000/note-sections/${id}/`);
        setSections(sections.filter(section => section.id !== id));
        setError("");
      } catch (error) {
        setError("Failed to delete section. Please try again.");
        console.error("Error deleting section:", error);
      }
    }
  };
  const navigateToNotes = (section) => {
    navigate(`/notes?section=${section.id}&name=${encodeURIComponent(section.title)}`);
  };
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Notes Sections</h1>
          <p className="text-gray-600 mt-1">Organize your thoughts and ideas</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusCircle size={20} />
          Create New Section
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {isCreating && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <form onSubmit={createSection}>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Section Title</label>
              <input
                type="text"
                value={newSection.title}
                onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter section title"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">Description</label>
              <textarea
                value={newSection.description}
                onChange={(e) => setNewSection({ ...newSection, description: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter section description"
                rows="3"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Save Section
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <div key={section.id} className="bg-white rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                  {section.description && (
                    <p className="text-gray-600 mt-2">{section.description}</p>
                  )}
                </div>
                <button
                  onClick={() => deleteSection(section.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors border-none bg-none "
                  aria-label="Delete section"
                >
                  <Trash2 size={20} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {section.note_count} {section.note_count === 1 ? 'note' : 'notes'}
                </span>
                <button
                  onClick={() => navigateToNotes(section)}
                  className="flex items-center px-4 py-2 gap-2 text-blue-600 hover:text-blue-800 transition-colors rounded border-none "
                >
                  View
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NoteSections;