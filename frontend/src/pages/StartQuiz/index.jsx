import React from "react";
import { useNavigate } from "react-router-dom";
import { FaClock, FaQuestionCircle } from "react-icons/fa";
import "./StartQuiz.css";

function StartQuiz() {
  const navigate = useNavigate();

  // Quiz details
  const quizDetails = {
    title: "JavaScript Fundamentals",
    description:
      "Challenge yourself on JavaScript basics, concepts, and syntax.",
    totalQuestions: 10,
    duration: "15 minutes",
  };

  return (
    <div className="start-quiz-page">
      <div className="quiz-card">
        <h1 className="quiz-title">{quizDetails.title}</h1>
        <p className="quiz-description">{quizDetails.description}</p>

        <div className="quiz-details">
          <div className="detail-item">
            <FaQuestionCircle className="detail-icon" />
            <span>{quizDetails.totalQuestions} Questions</span>
          </div>
          <div className="detail-item">
            <FaClock className="detail-icon" />
            <span>{quizDetails.duration}</span>
          </div>
        </div>

        <button className="start-quiz-button" onClick={() => navigate("/quiz")}>
          Start Quiz
        </button>
      </div>
    </div>
  );
}

export default StartQuiz;
