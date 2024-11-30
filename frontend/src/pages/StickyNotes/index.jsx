import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import "./StickyNotes.css";

const StickyNotes = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  
  const noteColors = [
    { bg: "bg-yellow-100", text: "text-gray-800" },
    { bg: "bg-green-100", text: "text-gray-800" },
    { bg: "bg-blue-100", text: "text-gray-800" },
    { bg: "bg-pink-100", text: "text-gray-800" },
    { bg: "bg-purple-100", text: "text-gray-800" },
    { bg: "bg-orange-100", text: "text-gray-800" },
    { bg: "bg-red-100", text: "text-gray-800" },
    { bg: "bg-indigo-100", text: "text-gray-800" },
  ];

  // Get URL parameters
  const params = new URLSearchParams(location.search);
  const sectionId = params.get("section");
  const sectionName = params.get("name");

  const axiosAuth = axios.create({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("my-app-auth")}`,
      "Content-Type": "application/json",
    },
  });

  // Calculate initial position for each task in a grid layout
  const calculatePosition = (index) => {
    const SPACING = 220;
    const VERTICAL_SPACING = 250;
    const ITEMS_PER_ROW = 4;

    const row = Math.floor(index / ITEMS_PER_ROW);
    const col = index % ITEMS_PER_ROW;

    return {
      x: 50 + col * SPACING,
      y: 100 + row * VERTICAL_SPACING,
    };
  };

  // Get a color for a note based on its index
  const getNoteColor = (index) => {
    return noteColors[index % noteColors.length];
  };

  useEffect(() => {
    const checkAuthAndFetchNotes = async () => {
      if (!user) {
        navigate("/login");
        return;
      }

      if (!sectionId) {
        navigate("/sections");
        return;
      }

      try {
        setLoading(true);
        const response = await axiosAuth.get(
          `http://127.0.0.1:8000/sticky-notes/`,
          {
            params: { section: sectionId },
          }
        );

        const notesWithPositions = response.data.map((note, index) => ({
          id: note.id,
          content: note.content,
          position: {
            x: note.position_x,
            y: note.position_y,
          },
          color: getNoteColor(index), // Assign color based on index
        }));

        setTasks(notesWithPositions);
        setError("");
      } catch (error) {
        console.error("Error fetching notes:", error);
        if (error.response?.status === 401) {
          navigate("/login");
        } else {
          setError("Failed to fetch notes. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchNotes();
  }, [user, sectionId, navigate]);

  const addTask = async (e) => {
    e.preventDefault();
    if (!sectionId) {
      setError("Please select a section first");
      return;
    }

    if (newTask.trim()) {
      const newTaskPosition = calculatePosition(tasks.length);
      try {
        const response = await axiosAuth.post(
          "http://127.0.0.1:8000/sticky-notes/",
          {
            content: newTask,
            position_x: newTaskPosition.x,
            position_y: newTaskPosition.y,
            section: parseInt(sectionId),
          }
        );

        setTasks([
          ...tasks,
          {
            id: response.data.id,
            content: response.data.content,
            position: {
              x: response.data.position_x,
              y: response.data.position_y,
            },
            color: getNoteColor(tasks.length),
          },
        ]);
        setNewTask("");
        setError("");
      } catch (error) {
        setError("Failed to create note. Please try again.");
        console.error("Error creating note:", error);
      }
    }
  };

  const updateTask = async (id, newContent) => {
    try {
      const taskToUpdate = tasks.find((task) => task.id === id);
      await axiosAuth.put(`http://127.0.0.1:8000/sticky-notes/${id}/`, {
        content: newContent,
        position_x: taskToUpdate.position.x,
        position_y: taskToUpdate.position.y,
        section: parseInt(sectionId),
      });

      setTasks(
        tasks.map((task) =>
          task.id === id ? { ...task, content: newContent } : task
        )
      );
      setError("");
    } catch (error) {
      setError("Failed to update note. Please try again.");
      console.error("Error updating note:", error);
    }
  };

  const moveTask = async (id, newPosition) => {
    const adjustedPosition = {
      x: newPosition.x + window.scrollX,
      y: newPosition.y + window.scrollY,
    };

    try {
      await axiosAuth.put(`http://127.0.0.1:8000/sticky-notes/${id}/`, {
        content: tasks.find((task) => task.id === id).content,
        position_x: adjustedPosition.x,
        position_y: adjustedPosition.y,
        section: parseInt(sectionId),
      });

      setTasks(
        tasks.map((task) =>
          task.id === id ? { ...task, position: adjustedPosition } : task
        )
      );
      setError("");
    } catch (error) {
      setError("Failed to update note position. Please try again.");
      console.error("Error updating note position:", error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axiosAuth.delete(`http://127.0.0.1:8000/sticky-notes/${id}/`);
      const newTasks = tasks.filter((task) => task.id !== id);
      const updatedTasks = newTasks.map((task, index) => ({
        ...task,
        color: getNoteColor(index),
      }));
      setTasks(updatedTasks);
      setError("");
    } catch (error) {
      setError("Failed to delete note. Please try again.");
      console.error("Error deleting note:", error);
    }
  };

  const startEditing = (id) => {
    setEditingTask(id);
  };

  const stopEditing = () => {
    setEditingTask(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading notes...</div>
      </div>
    );
  }

  if (!sectionId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-xl text-gray-600 mb-4">
          Please select a section to view notes
        </div>
        <button
          onClick={() => navigate("/notes-section")}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Go to Sections
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="board-header bg-white shadow-sm p-4 flex justify-between items-center">
        <h2 className="title text-2xl font-bold text-gray-800">
          {sectionName || "Sticky Board"}
        </h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/notes-section")}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Go to Sections
          </button>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}
        </div>
      </div>
      <div className="miro-board p-4">
        <form onSubmit={addTask} className="task-input mb-6">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new note..."
            className="border rounded px-4 py-2 w-full max-w-md"
          />
          <button
            type="submit"
            className="ml-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add
          </button>
        </form>
        <div className="board relative min-h-[600px]">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`sticky-note ${task.color.bg} ${task.color.text} p-4 rounded shadow`}
              style={{
                left: task.position.x,
                top: task.position.y,
                position: "absolute",
              }}
              draggable
              onDragEnd={(e) => {
                e.preventDefault();
                moveTask(task.id, { x: e.clientX, y: e.clientY });
              }}
            >
              {editingTask === task.id ? (
                <input
                  type="text"
                  value={task.content}
                  onChange={(e) => updateTask(task.id, e.target.value)}
                  onBlur={stopEditing}
                  autoFocus
                  className="w-full p-2 border rounded bg-white text-gray-800"
                />
              ) : (
                <>
                  <p onClick={() => startEditing(task.id)}>{task.content}</p>
                  <div className="flex gap-2 mt-2">
                    <button
                      className="edit-btn text-blue-600 hover:text-blue-800"
                      onClick={() => startEditing(task.id)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn text-red-600 hover:text-red-800"
                      onClick={() => deleteTask(task.id)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StickyNotes;