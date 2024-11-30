import React, { useState, useEffect } from "react";
import VideoCard from "../../components/VideoCard";
import SearchBar from "../../components/SearchBar";
import "./Explore.css";

const Explore = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch videos from backend when component mounts
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/video/all/");
        if (!response.ok) {
          throw new Error("Failed to fetch videos");
        }
        const data = await response.json();
        console.log(data.videos); // Log the videos array from the response
        setVideos(data.videos); // Update state with the array of videos
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <>
      <SearchBar />
      <div className="video-collection">
        {videos.map((video) => (
          <VideoCard key={video.video_id} video={video} />
        ))}
      </div>
    </>
  );
};

export default Explore;
