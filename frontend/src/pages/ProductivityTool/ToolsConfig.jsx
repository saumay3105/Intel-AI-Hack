// toolsConfig.js
import { Clock, Youtube, CheckSquare, Calendar, StickyNote, Map } from 'lucide-react';

const toolsConfig = [
  {
    id: "pomodoro",
    title: "Pomodoro Timer",
    description:
      "Stay focused with customizable work sessions and breaks. Track your productivity cycles and maintain a healthy work-life balance.",
    icon: Clock,
    route: "/pomodoro",
    color: "text-blue-600",
  },
  {
    id: "youtube",
    title: "YT Video Summarizer",
    description:
      "Extract key insights from YouTube videos. Save time by getting concise summaries of educational content.",
    icon: Youtube,
    route: "/youtube-summarizer",
    color: "text-red-600"
  },
  {
    id: "goals",
    title: "Goal Tracker",
    description:
      "Set and track your goals with smart suggestions for executable plans. Break down big goals into manageable tasks.",
    icon: CheckSquare,
    route: "/goals",
    color: "text-green-600"
  },
  {
    id: "planner",
    title: "Task Planner",
    description:
      "Organize your tasks with deadlines. Prioritize your work and never miss important due dates.",
    icon: Calendar,
    route: "/calendar",
    color: "text-purple-600"
  },
  {
    id: "notes",
    title: "Sticky Notes",
    description:
      "Capture quick thoughts and reminders. Create, organize, and manage digital sticky notes effortlessly.",
    icon: StickyNote,
    route: "/notes-section",
    color: "text-yellow-600"
  },
  {
    id: "roadmap",
    title: "Roadmap Creator",
    description:
      "Visualize your learning journey or project timeline. Create detailed roadmaps to track your progress.",
    icon: Map,
    route: "/roadmap",
    color: "text-indigo-600"
  }
];

export default toolsConfig;