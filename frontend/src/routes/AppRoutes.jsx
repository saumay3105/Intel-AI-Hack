import React, { useState, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "../pages/Home";
import About from "../pages/About";
import TextToVideo from "../pages/TextToVideo";
import Quiz from "../pages/Quiz";
import ScriptEditor from "../pages/ScriptEditor";
import VideoPreview from "../pages/VideoPreview";
import AnalyticsDashboard from "../pages/AnalyticsDashboard";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Explore from "../pages/Explore";
import Header from "../components/Commons/Header";
import PrivateRoute from "./PrivateRoutes";
import VideoPlayer from "../pages/VideoPlayer";
import Classroom from "../pages/Classroom";
import JoinClassroom from "../pages/JoinClassroom";
import ProductivityTools from "../pages/ProductivityTool";
import PomodoroTimer from "../pages/Pomodoro";
import Learn from "../pages/Learn";
import StartQuiz from "../pages/StartQuiz";
import YoutubeSummarizer from "../pages/YoutubeSummarizer";
import Goals from "../pages/Goals";
import StickyNotes from "../pages/StickyNotes";
import NoteSections from "../pages/NotesSection";
import ProcessingVideo from "../pages/ProcessingVideo";
import Roadmap from "../pages/Roadmap";

const sampleVideos = [
  {
    id: 1,
    title: "React Fundamentals",
    description:
      "Learn the basics of React in this comprehensive tutorial. We'll cover components, state, props, and more!",
    thumbnail:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmVVrYsn_xMPMKupj8yd0jls5_Wtn57xRQ9w&s",
    duration: "15:30",
    views: 1500000,
    date: "2023-10-15",
  },
  {
    id: 2,
    title: "CSS Grid Layout",
    description:
      "Master CSS Grid Layout with this in-depth guide. Create complex layouts with ease!",
    thumbnail: "https://cms-api-in.myhealthcare.co/image/20220910103120.jpeg",
    duration: "10:45",
    views: 750000,
    date: "2023-11-02",
  },
  {
    id: 3,
    title: "CSS Grid Layout",
    description:
      "Master CSS Grid Layout with this in-depth guide. Create complex layouts with ease!",
    thumbnail: "https://cms-api-in.myhealthcare.co/image/20220910103120.jpeg",
    duration: "10:45",
    views: 750000,
    date: "2023-11-02",
  },
  {
    id: 4,
    title: "CSS Grid Layout",
    description:
      "Master CSS Grid Layout with this in-depth guide. Create complex layouts with ease!",
    thumbnail: "https://cms-api-in.myhealthcare.co/image/20220910103120.jpeg",
    duration: "10:45",
    views: 750000,
    date: "2023-11-02",
  },
  // Add more sample videos here
];

const AppRoutes = () => {
  const location = useLocation();
  const [showHeader, setShowHeader] = useState(true);

  // Hide Header on classroom page
  useEffect(() => {
    setShowHeader(location.pathname !== "/classroom");
  }, [location.pathname]);

  return (
    <>
      {showHeader && <Header />}
      <Routes>
        <Route index path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route
          path="/create"
          element={<PrivateRoute element={TextToVideo} />}
        />
        <Route path="/quiz" element={<PrivateRoute element={Quiz} />} />
        <Route
          path="/script-editor"
          element={<PrivateRoute element={ScriptEditor} />}
        />
        <Route
          path="/video-preview"
          element={<PrivateRoute element={VideoPreview} />}
        />
        <Route
          path="/productivity-tools"
          element={<PrivateRoute element={ProductivityTools} />}
        />
        <Route
          path="/analytics-dashboard"
          element={<PrivateRoute element={AnalyticsDashboard} />}
        />
        <Route
          path="/pomodoro"
          element={<PrivateRoute element={PomodoroTimer} />}
        />
        <Route
          path="/youtube-summarizer"
          element={<PrivateRoute element={YoutubeSummarizer} />}
        />
        <Route path="/goals" element={<PrivateRoute element={Goals} />} />
        <Route
          path="/notes-section"
          element={<PrivateRoute element={NoteSections} />}
        />
        <Route path="/notes" element={<StickyNotes />} />
        <Route path="/learn" element={<PrivateRoute element={Learn} />} />
        <Route path="/roadmap" element={<PrivateRoute element={Roadmap} />} />

        <Route
          path="/start-quiz"
          element={<PrivateRoute element={StartQuiz} />}
        />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/explore" element={<Explore videos={sampleVideos} />} />
        <Route
          path="/video/processing"
          element={<PrivateRoute element={ProcessingVideo} />}
        />
        <Route path="/video/:video_id" element={<VideoPlayer />} />
        <Route path="/join-classroom" element={<JoinClassroom />} />
        <Route path="/classroom" element={<Classroom />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
