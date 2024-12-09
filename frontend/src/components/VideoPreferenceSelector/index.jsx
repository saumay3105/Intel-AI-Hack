import React, { useState } from "react";
import "./VideoPreferenceSelector.css";

const VideoPreferenceSelector = ({ setVideoPreference }) => {
  const [selectedOption, setSelectedOption] = useState("simplify");

  const handleOptionChange = (event) => {
    const { value } = event.target;
    setSelectedOption(value);
    setVideoPreference(value);
  };

  return (
    <div className="video-preference-container">
      <h3 className="video-preference-heading">Choose an option:</h3>
      <div className="video-preference-options">
        <label className="video-preference-option">
          <input
            type="radio"
            value="simplify"
            checked={selectedOption === "simplify"}
            onChange={handleOptionChange}
          />
          Simplify
        </label>
        <label className="video-preference-option">
          <input
            type="radio"
            value="elaborate"
            checked={selectedOption === "elaborate"}
            onChange={handleOptionChange}
          />
          Elaborate
        </label>
        <label className="video-preference-option">
          <input
            type="radio"
            value="concise"
            checked={selectedOption === "concise"}
            onChange={handleOptionChange}
          />
          Concise
        </label>
      </div>
    </div>
  );
};

export default VideoPreferenceSelector;