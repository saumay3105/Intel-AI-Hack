import React from 'react';
import { Link } from 'react-router-dom';
import toolsConfig from './ToolsConfig';
import './ProductivityTools.css'

const Card = ({ children, className = '' }) => (
  <div className={`card ${className}`}>
    {children}
  </div>
);

const ProductivityTools = () => {
  return (
    <div className="productivity-tools">
      <div className="tools-hero">
        <h1>Productivity Tools</h1>
        <p>Everything you need to boost your productivity in one place</p>
      </div>
      
      <main className="tools-grid">
        {toolsConfig.map((tool) => {
          const IconComponent = tool.icon;
          
          return (
            <Link to={tool.route} key={tool.id} className="tool-card-link">
              <Card className="tool-card">
                <div className="tool-card-content">
                  <div className="tool-icon">
                    <IconComponent className={`w-12 h-12 mb-4 ${tool.color}`} />
                  </div>
                  <h3 className="tool-title">{tool.title}</h3>
                  <p className="tool-description">
                    {tool.description}
                  </p>
                </div>
              </Card>
            </Link>
          );
        })}
      </main>
    </div>
  );
};

export default ProductivityTools;