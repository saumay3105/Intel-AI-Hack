import React from "react";
import { Link } from "react-router-dom";
import "./JoinClassroom.css";

function JoinClassroom() {
  return (
    <div className="join-classroom-container">
      <div className="join-classroom-card">
        <h2 className="join-classroom-title">Join your AI Classroom</h2>
        <p className="join-classroom-text">
          Click the button below to enter your virtual classroom!
        </p>
        <Link to="/classroom" className="join-button">
          Join Now
        </Link>
      </div>
    </div>
  );
}

export default JoinClassroom;
