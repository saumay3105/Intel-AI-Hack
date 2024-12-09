import React, { useState } from "react";
import { Download, Send } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";


const Arrow = () => (
  <svg
    className="absolute top-1/2 right-0 w-24 h-12 transform translate-x-full -translate-y-1/2"
    viewBox="0 0 100 40"
  >
    <defs>
      <linearGradient id="arrow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style={{ stopColor: "#6366f1" }} />
        <stop offset="100%" style={{ stopColor: "#a855f7" }} />
      </linearGradient>
    </defs>
    <path
      d="M0,20 L80,20 L70,10 L80,20 L70,30"
      fill="none"
      stroke="url(#arrow-gradient)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="group-hover:animate-pulse"
    />
  </svg>
);

const RoadmapGenerator = () => {
  const [topic, setTopic] = useState("");
  const [roadmap, setRoadmap] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateRoadmap = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("http://127.0.0.1:8000/generate-roadmap/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project_title: topic,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch roadmap data");
      }
      const data = await response.json();
      setRoadmap({
        title: topic,
        steps: data.roadmap,
      });
    } catch (err) {
      setError("Failed to generate roadmap. Please try again.");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadAsPDF = async () => {
    const element = document.getElementById("roadmap-content");
    if (element) {
      try {
        const canvas = await html2canvas(element, {
          scale: 2, 
          backgroundColor: "#f8fafc", 
        });
  
        const pdf = new jsPDF("l", "mm", "a4"); 
        const imgData = canvas.toDataURL("image/png");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${roadmap.title.toLowerCase()}-roadmap.pdf`);
      } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Failed to generate PDF. Please try again.");
      }
    } else {
      console.error("Roadmap content not found.");
    }
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
          Roadmap Generator
        </h1>

        <div className="relative flex items-center max-w-2xl mx-auto">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter your learning goal..."
            className="w-full px-6 py-4 bg-white rounded-full shadow-lg border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
            disabled={isLoading}
          />
          <button
            onClick={generateRoadmap}
            disabled={isLoading || !topic.trim()}
            className={`absolute right-2 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-2 shadow-md ${
              (isLoading || !topic.trim()) && "opacity-50 cursor-not-allowed"
            }`}
          >
            <Send size={18} />
            {isLoading ? "Generating..." : "Generate"}
          </button>
        </div>

        {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}
      </div>

      {roadmap && (
        <div className="max-w-6xl mx-auto relative">
          <button
            onClick={downloadAsPDF}
            className="mb- -top-12 right-0 p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            <Download size={24} />
            <span className="text-sm font-medium">Download PDF</span>
          </button>

          <div
            id="roadmap-content"
            className="relative p-8 bg-white rounded-3xl shadow-xl overflow-hidden"
          >
            <h2 className="text-3xl font-bold mb-12 text-center text-gray-800">
              {roadmap.title} <span className="text-indigo-500">Journey</span>
            </h2>

            <div className="flex flex-wrap justify-center items-center gap-32 px-12">
              {roadmap.steps.map((step, index) => (
                <div key={step.stepNumber} className="relative group">
                  {index < roadmap.steps.length - 1 && <Arrow />}

                  <div
                    className={`w-72 transform transition-all duration-500 
                    ${
                      index % 2 === 0
                        ? "-translate-y-6 hover:-translate-y-8"
                        : "translate-y-6 hover:translate-y-4"
                    }
                    group-hover:shadow-2xl`}
                  >
                    <div className="relative p-6 bg-white rounded-2xl border-2 border-transparent hover:border-indigo-100 shadow-lg backdrop-blur-lg">
                      <div className="absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full opacity-50"></div>

                      <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                        {step.stepNumber}
                      </div>

                      <div className="mt-4">
                        <h3 className="text-xl font-bold mb-3 text-gray-800">
                          {step.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                          {step.description}
                        </p>
                        <div className="mt-4">
                          <span className="px-4 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 rounded-full text-sm font-medium">
                            {step.daysToFinish} days
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadmapGenerator;
