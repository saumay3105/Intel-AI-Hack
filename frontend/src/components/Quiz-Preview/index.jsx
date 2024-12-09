import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Commons/Header";
import axios from "axios";
import "./QuizPreview.css";

const QuizPreview = ({ questions }) => {
  // const navigate = useNavigaate();
  // const [questions, setQuestions] = useState([]);

  //   useEffect(() => {
  //     const fetchQuestions = async () => {
  //       const jobId = localStorage.getItem("currentJobId");
  //       console.log("Job ID from localStorage:", jobId);

  //       if (!jobId) {
  //         toast.error("No job ID found. Please upload a document first.");
  //         setIsLoading(false);
  //         return;
  //       }

  //       try {
  //         const response = await axios.get(
  //           `http://127.0.0.1:8000/generate-questions/${jobId}/`
  //         );

  //         if (response.data) {
  //           setQuestions(response.data);
  //         } else {
  //           toast.error("Unexpected response from server");
  //         }
  //       } catch (error) {
  //         console.error("Error fetching questions:", error);
  //         if (error.response) {
  //           console.error("Response data:", error.response.data);
  //           console.error("Response status:", error.response.status);
  //         }
  //         toast.error(`Failed to fetch the questions: ${error.message}`);
  //       }
  //     };

  //     fetchQuestions();
  //   }, []);

  return (
    <div className="quiz-preview-container">
      <h1>Quiz Preview</h1>
      {questions.length === 0 ? (
        <p>No questions available.</p>
      ) : (
        <ul className="question-list">
          {questions.map((question, index) => (
            <li key={index} className="question-item">
              <h2>Question {index + 1}</h2>
              <p className="question-text">{question.question}</p>
              <div className="question-details">
                <p>
                  <strong>Type:</strong> {question.type}
                </p>
                <p>
                  <strong>Difficulty:</strong> {question.difficulty}
                </p>
                <p>
                  <strong>Use:</strong> {question.use}
                </p>
              </div>
              {question.type === "mcq" && (
                <div className="options">
                  <p>
                    <strong>Options:</strong>
                  </p>
                  <ul>
                    {question.options.map((option, optionIndex) => (
                      <li key={optionIndex}>{option}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p>
                <strong>Correct Answer:</strong> {question.correctAnswer}
              </p>
              <p>
                <strong>Explanation:</strong> {question.explanation}
              </p>
            </li>
          ))}
        </ul>
      )}
      <ToastContainer />
    </div>
  );
};

export default QuizPreview;
