import React from "react";
import { useNavigate } from "react-router-dom";
import quizIcon from "../../assets/quiz.png";
import videoGenIcon from "../../assets/videoGen.png";
import "./Learn.css";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="learn-page">
      <h1 className="learn-page__title">Choose an Option</h1>
      <div className="card-container">
        <div
          className="card quiz-card"
          onClick={() => navigate("/create", { state: { type: "quiz" } })}
        >
          <img src={quizIcon} />
          <h2 className="card-title">Take Quiz</h2>
          <p className="card-description">
            Test your knowledge with an interactive quiz.
          </p>
        </div>

        <div
          className="card video-card"
          onClick={() => navigate("/create", { state: { type: "video" } })}
        >
          <img src={videoGenIcon} />

          <h2 className="card-title">Generate Video</h2>
          <p className="card-description">
            Create engaging videos from your documents.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
