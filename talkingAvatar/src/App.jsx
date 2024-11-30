import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";
import React, { useContext, useEffect, useState } from "react";
import { SpeakingContext } from "./contexts/AvatarState";

const quizQuestions = [
  {
    question: "What is the capital of France?",
    options: ["Berlin", "Madrid", "Paris", "Rome"],
    correct: 2,
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Earth", "Mars", "Jupiter", "Saturn"],
    correct: 1,
  },
];

function App() {
  const { speaking, setSpeaking } = useContext(SpeakingContext);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isCorrect, setIsCorrect] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [isRevising, setIsRevising] = useState(false);
  const [script, setScript] = useState("");

  const handleAnswer = (index) => {
    const correct = quizQuestions[currentQuestion].correct === index;
    setIsCorrect(correct);
    setSpeaking(true);

    // Set the script for correct/incorrect response
    setScript(correct ? "correct" : "incorrect");

    setTimeout(() => {
      setCurrentQuestion((prev) => (prev + 1) % quizQuestions.length);
      setIsCorrect(null);
    }, 2000);
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setIsRevising(false);
    setScript("correct"); // Only accept correct/incorrect now
  };

  const startRevision = () => {
    setIsRevising(true);
    setQuizStarted(false);
    setScript("introduction");
    setSpeaking(true);

    // Play introduction, then summary
    setTimeout(() => {
      setScript("summary");
    }, 5000); // Adjust timing as needed for introduction audio length
  };

  return (
    <div style={{ position: "relative", height: "100vh", overflow: "hidden" }}>
      <div style={{ position: "absolute", bottom: 10, left: "35vw", width: "30vw", height: "45vh" }}>
        <Canvas shadows camera={{ position: [0, 0, 8], fov: 42 }}>
          <color attach="background" args={["#e2e2e2"]} />
          <Experience isCorrect={isCorrect} script={script} />
        </Canvas>
      </div>

      {!quizStarted && !isRevising && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
          }}
        >
          <button onClick={startQuiz} style={buttonStyle}>
            Start Quiz
          </button>
          <button onClick={startRevision} style={buttonStyle}>
            Revise
          </button>
        </div>
      )}

      {quizStarted && (
        <div
          style={{
            position: "absolute",
            top: "10vh",
            left: "50%",
            transform: "translateX(-50%)",
            width: "40vw",
            textAlign: "center",
          }}
        >
          <h2>{quizQuestions[currentQuestion].question}</h2>
          <div>
            {quizQuestions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                style={{
                  ...buttonStyle,
                  backgroundColor:
                    isCorrect === null ? "#f0f0f0" : isCorrect ? "#4CAF50" : "#f44336",
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {isRevising && (
        <div
          style={{
            position: "absolute",
            top: "10vh",
            left: "50%",
            transform: "translateX(-50%)",
            width: "40vw",
            textAlign: "center",
          }}
        >
          <h2>Revising the content...</h2>
        </div>
      )}
    </div>
  );
}

const buttonStyle = {
  padding: "10px 20px",
  margin: "10px",
  backgroundColor: "#008CBA",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

export default App;
