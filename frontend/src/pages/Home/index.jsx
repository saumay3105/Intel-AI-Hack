import Header from "@/components/Commons/Header";
import FeatureCard from "@/components/Commons/FeatureCard";
import Footer from "@/components/Commons/Footer";
import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <>
      <div className="hero">
        <video autoPlay muted loop className="background-video">
          <source src="/bg3.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="hero-content">
          <h2 className="hero-heading">
            <span>
              Convert your
              <span className="hero__boring-text"> boring textbooks</span>
            </span>
            <span>
              into
              <span className="hero__gradient-text">
                &nbsp;Engaging Educational Videos
              </span>
            </span>
          </h2>
          <p className="hero__description">
            Upload your study materials, and we’ll create engaging videos that
            bring your subjects to life. ReadMe - your ultimate study companion.
          </p>
          <div className="buttons">
            <a href="#features" className="btn-secondary">
              Discover Features
            </a>
            <Link to="/create" className="btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </div>
      <main className="homepage">
        <section id="features" className="features">
          <h2 className="t">Magical Features</h2>
          <div className="features-container">
            <div className="features-grid">
              <FeatureCard
                title="Text-to-Video"
                description="Seamlessly transform text from PDFs, brochures, and other documents into engaging videos. Say goodbye to monotonous reading and embrace a more dynamic way to digest information."
              />
              <FeatureCard
                title="Interactive Quizzes"
                description="After watching the videos, users can test their understanding with automatically generated quizzes. This feature ensures that viewers not only watch but also retain the information presented, making learning both effective and interactive."
              />
              <FeatureCard
                title="Cross-Language Narration"
                description="Expand your reach by dubbing video content into different languages. This feature allows users to cater to a diverse audience, making your content more accessible and impactful across linguistic boundaries."
              />
            </div>
          </div>
        </section>
        <section id="about" className="about">
          <div className="container">
            <h2 className="t">About ReadMe</h2>
            <p>
              Are you tired of reading through lengthy documents without fully
              grasping the content? Meet ReadMe—a cutting-edge tool designed to
              transform your text into engaging videos. With ReadMe, you can
              effortlessly convert any text into a video format, making it
              easier to absorb information. But that's not all. Test your
              understanding with interactive quizzes, and earn rewards as you
              enhance your knowledge. Experience a new way of learning with
              ReadMe, where text comes to life.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default Home;
