import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./upload.css";
import VideoPreferenceSelector from "../VideoPreferenceSelector";
import LanguageSelector from "../LanguageSelector";
import { AiOutlineUpload } from "react-icons/ai";
import { FaCamera } from "react-icons/fa";
import { BsStars } from "react-icons/bs";
import axios from 'axios'; 

const FileUpload = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [capturedImage, setCapturedImage] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoPreference, setVideoPreference] = useState("simplify");
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const { state } = useLocation();
  const [title, setTitle] = useState();

  useEffect(() => {
    if (state.type === "quiz") {
      setTitle("Generate Quiz");
    } else {
      setTitle("Generate Video");
    }
  }, []);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
    setCapturedImage(null);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 && !capturedImage && textInput.trim() === "") {
      toast.error(
        "Please select a file, capture an image, or input text before uploading.",
        { position: "top-right" }
      );
      return;
    }

    const formData = new FormData();
    
    // Add the file or text to formData
    if (selectedFiles.length > 0) {
      formData.append("file", selectedFiles[0]);
    } else if (capturedImage) {
      formData.append("file", capturedImage);
    } else {
      formData.append("text", textInput);
    }
    
    // Add preferences
    formData.append("video_preference", videoPreference);
    formData.append("language", selectedLanguage);

    setLoading(true);

    try {
      if (state.type === "quiz") {
        // Make direct API call instead of using localStorage
        const response = await fetch("http://127.0.0.1:8000/generate-questions/", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        // Store only the response data in localStorage
        localStorage.setItem("quizData", JSON.stringify(result.data));
        navigate("/quiz");
      } else {
        const response = await axios.post(
          "http://127.0.0.1:8000/generate-video/",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        if (response.status === 202) {
          localStorage.setItem("currentJobId", response.data.job_id);
          navigate("/video/processing");
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      setLoading(false);
      toast.error("Failed to Process. Please try again.", {
        position: "top-right",
      });
    }
  };

  const openCamera = () => {
    setCapturedImage(null);
    setCameraOpen(true);
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      })
      .catch((err) => {
        console.error("Error accessing the camera: ", err);
        toast.error("Cannot access the camera. Please try again.");
      });
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      const imageFile = new File([blob], "captured_image.jpg", {
        type: "image/jpeg",
      });
      setCapturedImage(imageFile);
      setSelectedFiles([]);
      setCameraOpen(false);
      video.srcObject.getTracks().forEach((track) => track.stop());
    });
  };

  const renderPreview = (file) => {
    const fileType = file.type;
    const fileExtension = file.name.split(".").pop().toUpperCase();

    if (fileType.startsWith("image/")) {
      const imageUrl = URL.createObjectURL(file);
      return (
        <img src={imageUrl} alt={file.name} className="file-preview-image" />
      );
    } else
      return (
        <div className="file-preview-icon">
          {"📄" + fileExtension || "📎 File"}
        </div>
      );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <h2 className="upload-heading">Processing your document...</h2>
        <img src="./public/load-35.gif" alt="Loading..." className="img-load" />
      </div>
    );
  }

  return (
    <div className="upload-container">
      <h1 className="upload__title">{title}</h1>
      <div className="tab-navigation">
        <button
          onClick={() => setActiveTab("upload")}
          className={activeTab === "upload" ? "active-tab" : ""}
        >
          Upload File
        </button>
        <button
          onClick={() => setActiveTab("capture")}
          className={activeTab === "capture" ? "active-tab" : ""}
        >
          Capture
        </button>
        <button
          onClick={() => setActiveTab("text")}
          className={activeTab === "text" ? "active-tab" : ""}
        >
          Enter Text
        </button>
      </div>

      {activeTab === "upload" && (
        <div className="tab-content">
          <input
            type="file"
            accept=".pdf, .doc, .docx, .pptx, image/*"
            className="upload-file-input"
            onChange={handleFileChange}
            id="file-upload"
          />
          <p className="upload-description">
            Supported file formats: PDF, DOC, DOCX, PPTX, and images (JPEG, PNG,
            etc.)
          </p>
          <label htmlFor="file-upload" className="button-outlined">
            <AiOutlineUpload style={{ marginRight: "8px" }} />
            Choose a file
          </label>
          <div className="file-preview">
            {selectedFiles.length > 0 && (
              <ul>
                {selectedFiles.map((file, index) => (
                  <li key={index} className="file-preview-item">
                    {renderPreview(file)}
                    <p>{file.name}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {activeTab === "capture" && (
        <div className="tab-content">
          <p className="upload-description">
            Use your camera to capture an image of your textbook page
          </p>
          {!cameraOpen && (
            <button className="button-outlined" onClick={openCamera}>
              <FaCamera style={{ marginRight: "8px" }} />
              Open Camera
            </button>
          )}
          {cameraOpen && (
            <div className="camera-container">
              <video ref={videoRef} className="camera-video" />
              <button className="button-outlined" onClick={captureImage}>
                Capture
              </button>
            </div>
          )}
          <canvas
            ref={canvasRef}
            className="hidden-canvas"
            width="640"
            height="480"
            style={{ display: "none" }}
          />
          {capturedImage && (
            <div className="file-preview">
              <img
                src={URL.createObjectURL(capturedImage)}
                alt="Captured Preview"
                className="file-preview-image"
              />
            </div>
          )}
        </div>
      )}

      {activeTab === "text" && (
        <div className="tab-content">
          <textarea
            className="upload-text-input"
            placeholder="Enter your text here..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            rows={7}
          />
        </div>
      )}

      <LanguageSelector setSelectedLanguage={setSelectedLanguage} />
      <VideoPreferenceSelector setVideoLength={setVideoPreference} />
      <ToastContainer />
      <button className="upload-button" onClick={handleUpload}>
        <BsStars style={{ marginRight: "8px" }} />
        Start Generating
      </button>
    </div>
  );
};

export default FileUpload;
