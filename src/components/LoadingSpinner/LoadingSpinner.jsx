import "./LoadingSpinner.css";

const LoadingSpinner = ({ message = "Loading data...", minHeight = "240px", size = "normal" }) => {
  return (
    <div className={`rich-loader-container ${size}`} style={{ minHeight }}>
      <div className="rich-loader-wrapper">
        {/* Outer orbital gradient spinner */}
        <div className="rich-loader-ring">
          <div className="ring-inner"></div>
        </div>
        {/* Inner pulsating brand badge */}
        <div className="rich-loader-badge">
          <i className="bi bi-printer-fill"></i>
        </div>
      </div>
      
      {/* Animated loading text */}
      {message && (
        <div className="rich-loader-text-box mt-3">
          <span className="rich-loader-text">{message}</span>
          <span className="loading-dots">
            <span className="dot dot1">.</span>
            <span className="dot dot2">.</span>
            <span className="dot dot3">.</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;
