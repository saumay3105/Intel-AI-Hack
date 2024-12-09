import { Loader2 } from "lucide-react";
import "./Quiz.css";
import trophy from "../../assets/trophy.png";
import streakicon from "../../assets/streak.png";
import higheststreakicon from "../../assets/higheststreakicon.png";
import timericon from "../../assets/timericon.png";
import correctSound from "../../assets/correctsound.mp3";
import incorrectSound from "../../assets/incorrectsound.mp3";
import Result from "../Result";
import { useState, useEffect, useCallback } from "react";

function Quiz() {
  const [quizData, setQuizData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [points, setPoints] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [answerLocked, setAnswerLocked] = useState(false);
  const [timer, setTimer] = useState(30);
  const [streak, setStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [questionResults, setQuestionResults] = useState([]);
  const [timeSpent, setTimeSpent] = useState([]);
  const [finalScore, setFinalScore] = useState(0);
  const [isTimeoutOccurred, setIsTimeoutOccurred] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [questionTimes, setQuestionTimes] = useState([]);
  const [quizResults, setQuizResults] = useState(null);
  const [showResultsSummary, setShowResultsSummary] = useState(false);
  const [isLastQuestion, setIsLastQuestion] = useState(false);

  const handleNextQuestion = useCallback(() => {
    if (!quizData || currentQuestionIndex >= quizData.questions.length - 1) {
      setIsLastQuestion(true);
      setShowResultsSummary(true);
      return;
    }

    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    setSelectedOption(null);
    setAnswerLocked(false);
    setTimer(30);
    setIsTimeoutOccurred(false);
  }, [currentQuestionIndex, quizData]);

  const finishQuiz = useCallback(
    (lastQuestionCorrect) => {
      if (!quizData) return;

      const allResults = [
        ...questionResults,
        { isCorrect: lastQuestionCorrect },
      ];
      let currentStreak = 0;
      let maxStreak = 0;
      let correctAnswers = 0;

      allResults.forEach((result) => {
        if (result.isCorrect) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
          correctAnswers++;
        } else {
          currentStreak = 0;
        }
      });

      const finalScore = correctAnswers * 10 + maxStreak * 10;

      setIsQuizFinished(true);
      setFinalScore(finalScore);

      const quizResults = {
        topic: quizData.topic,
        questions: quizData.questions,
        user_answers: userAnswers,
        question_times: questionTimes,
      };

      return {
        finalScore,
        correctAnswers,
        totalQuestions: quizData.questions.length,
        highestStreak: maxStreak,
        timeSpent: questionTimes,
        quizResults,
      };
    },
    [quizData, questionResults, questionTimes, userAnswers]
  );

  const handleTimeout = useCallback(() => {
    if (!quizData || isTimeoutOccurred) return;

    setIsTimeoutOccurred(true);

    const updateStates = () => {
      setUserAnswers((prev) => [
        ...prev,
        { selected_answer: null, answered: false },
      ]);
      setQuestionTimes((prev) => [...prev, 30]);
      setAnswerLocked(true);
      setSelectedOption(null);
      setStreak(0);
      setQuestionResults((prev) => [...prev, { isCorrect: false }]);
    };

    updateStates();

    const audio = new Audio("incorrectSound");
    audio.play();

    if (currentQuestionIndex === quizData.questions.length - 1) {
      finishQuiz(false);
    }
  }, [currentQuestionIndex, isTimeoutOccurred, quizData, finishQuiz]);

  const loadQuizData = useCallback(() => {
    setIsLoading(true);
    try {
      const quizDataString = localStorage.getItem("quizData");

      if (!quizDataString) {
        throw new Error("No quiz data found. Please start a new quiz.");
      }

      const data = JSON.parse(quizDataString);
      if (!data.questions || data.questions.length === 0) {
        throw new Error("No questions found in quiz data");
      }

      setQuizData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuizData();
  }, [loadQuizData]);

  useEffect(() => {
    let interval;
    if (
      hasStarted &&
      timer > 0 &&
      !answerLocked &&
      !isTimeoutOccurred &&
      quizData
    ) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && !isTimeoutOccurred) {
      handleTimeout();
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [
    timer,
    answerLocked,
    isTimeoutOccurred,
    quizData,
    hasStarted,
    handleTimeout,
  ]);

  const handleShowResults = useCallback(() => {
    const allResults = questionResults;
    let currentStreak = 0;
    let maxStreak = 0;
    let correctAnswers = 0;

    allResults.forEach((result) => {
      if (result.isCorrect) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
        correctAnswers++;
      } else {
        currentStreak = 0;
      }
    });

    const finalScore = correctAnswers * 10 + maxStreak * 10;

    const results = {
      finalScore,
      correctAnswers,
      totalQuestions: quizData.questions.length,
      highestStreak: maxStreak,
      timeSpent: questionTimes,
      quizResults: {
        topic: quizData.topic,
        questions: quizData.questions,
        user_answers: userAnswers,
        question_times: questionTimes,
      },
    };

    setQuizResults(results);
    setIsQuizFinished(true);
    setFinalScore(finalScore);
  }, [questionResults, quizData, questionTimes, userAnswers]);

  const handleAnswer = useCallback(
    (index) => {
      if (!quizData || answerLocked) return;

      const currentQuestion = quizData.questions[currentQuestionIndex];
      const selectedAnswer = currentQuestion.options[index];
      const timeTaken = 30 - timer;

      setUserAnswers((prev) => [
        ...prev,
        { selected_answer: selectedAnswer, answered: true },
      ]);
      setQuestionTimes((prev) => [...prev, timeTaken]);

      const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
      const audio = new Audio(isCorrect ? correctSound : incorrectSound);
      audio.play();

      setAnswerLocked(true);
      setSelectedOption(selectedAnswer);
      setTimeSpent((prev) => [...prev, timeTaken]);

      if (isCorrect) {
        setPoints((prevPoints) => prevPoints + 10);
        setStreak((prevStreak) => {
          const newStreak = prevStreak + 1;
          setHighestStreak((prev) => Math.max(prev, newStreak));
          return newStreak;
        });
      } else {
        setStreak(0);
      }

      setQuestionResults((prev) => [...prev, { isCorrect }]);

      if (currentQuestionIndex === quizData.questions.length - 1) {
        setIsLastQuestion(true);
      }
    },
    [quizData, answerLocked, currentQuestionIndex, timer]
  );

 const handleRestart = useCallback(() => {
   loadQuizData(); 
   setCurrentQuestionIndex(0);
   setPoints(0);
   setSelectedOption(null);
   setIsQuizFinished(false);
   setAnswerLocked(false);
   setTimer(30);
   setStreak(0);
   setHighestStreak(0);
   setQuestionResults([]);
   setTimeSpent([]);
   setFinalScore(0);
   setIsTimeoutOccurred(false);
   setHasStarted(false);
   setUserAnswers([]);
   setQuestionTimes([]);
   setQuizResults(null);
   setShowResultsSummary(false);
   setIsLastQuestion(false);
 }, [loadQuizData]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">
            Preparing your quiz...
          </h2>
          <p className="text-gray-500 mt-2">This might take a moment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            Error loading quiz
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleRestart}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (
    !quizData ||
    !quizData.questions ||
    !quizData.questions[currentQuestionIndex]
  ) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            No quiz questions available
          </h2>
          <button
            onClick={handleRestart}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-auto p-8 bg-white rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Ready to Begin?
          </h1>

          <div className="space-y-6 mb-8">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-semibold">
                    {quizData.questions.length}
                  </span>
                </div>
                <span className="text-gray-700 font-medium">Questions</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-600 font-semibold">30</span>
                </div>
                <span className="text-gray-700 font-medium">
                  Seconds per question
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setHasStarted(true)}
            className="w-full py-3 px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold text-lg shadow-md"
          >
            Start Quiz
          </button>

          <p className="text-gray-500 text-sm text-center mt-4">
            Good luck! Take your time to read each question carefully.
          </p>
        </div>
      </div>
    );
  }

  if (showResultsSummary && !isQuizFinished) {
    const lastQuestion = quizData.questions[currentQuestionIndex];
    const isLastAnswerCorrect = selectedOption === lastQuestion.correctAnswer;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-auto p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Quiz Complete!
          </h2>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
              <span>Current Score:</span>
              <span className="font-bold">{points} points</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
              <span>Final Streak:</span>
              <span className="font-bold">{streak}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
              <span>Highest Streak:</span>
              <span className="font-bold">{highestStreak}</span>
            </div>
          </div>

          <button
            onClick={handleShowResults}
            className="w-full py-3 px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold text-lg shadow-md"
          >
            Show Detailed Results
          </button>
        </div>
      </div>
    );
  }

  if (isQuizFinished && quizResults) {
    return <Result {...quizResults} onRestart={handleRestart} />;
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <div className="quiz-question-number">
          Question {currentQuestionIndex + 1} / {quizData.questions.length}
        </div>
        <div className="quiz-streak">
          <img src={streakicon} alt="Streak" />
          Streak: {streak}
        </div>
        <div className="quiz-score">
          <img src={trophy} alt="Trophy" />
          Score: {points} points
        </div>
        <div className="quiz-highest-streak">
          <img src={higheststreakicon} alt="Highest Streak" />
          Highest Streak: {highestStreak}
        </div>
        <div className="quiz-timer">
          <img src={timericon} alt="Timer" />
          Time: {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
        </div>
      </div>

      <div className="question-container">
        <h3 className="question">{currentQuestion.question}</h3>
        <div className="options">
          {currentQuestion.options.map((option, index) => {
            const isCorrect = option === currentQuestion.correctAnswer;
            const isIncorrect =
              answerLocked && selectedOption === option && !isCorrect;
            const isSelected = selectedOption === option;

            return (
              <button
                key={index}
                className={`option 
                  ${isCorrect && answerLocked ? "correct" : ""}
                  ${isIncorrect ? "incorrect" : ""}
                  ${isSelected ? "selected" : ""}
                  ${answerLocked ? "disabled-hover" : ""}
                `}
                onClick={() => handleAnswer(index)}
                disabled={answerLocked}
              >
                {option}
              </button>
            );
          })}
        </div>

        <div className="explanation-and-next">
          {answerLocked && (
            <p
              className={`explanation ${
                selectedOption === currentQuestion.correctAnswer
                  ? "correct-explanation"
                  : "incorrect-explanation"
              }`}
            >
              {selectedOption === currentQuestion.correctAnswer
                ? currentQuestion.explanation
                : `That's not the right answer! ${currentQuestion.explanation}`}
            </p>
          )}
          {answerLocked &&
            currentQuestionIndex < quizData.questions.length - 1 && (
              <div className="navigation-buttons">
                <button className="next-btn" onClick={handleNextQuestion}>
                  Next
                </button>
              </div>
            )}
          {isLastQuestion && answerLocked && (
            <div className="navigation-buttons">
              <button
                className="next-btn"
                onClick={() => setShowResultsSummary(true)}
              >
                Show Results
              </button>
            </div>
          )}
        </div>
      </div>

      {showResultsSummary && (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
          <div className="max-w-md w-full mx-auto p-8 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Quiz Complete!
            </h2>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                <span>Final Score:</span>
                <span className="font-bold">{points} points</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                <span>Final Streak:</span>
                <span className="font-bold">{streak}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                <span>Highest Streak:</span>
                <span className="font-bold">{highestStreak}</span>
              </div>
            </div>

            <button
              onClick={handleShowResults}
              className="w-full py-3 px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold text-lg shadow-md"
            >
              Show Detailed Results
            </button>
          </div>
        </div>
      )}

      {isQuizFinished && quizResults && (
        <Result {...quizResults} onRestart={handleRestart} />
      )}
    </div>
  );
}

export default Quiz;
