import './Loader.css';

const Loader: React.FC = () => {
  return (
    <div className="loader-container">
      <div className="loader">
        {/* Spinning ticket animation */}
        <div className="ticket-animation"></div>
      </div>
      <p className="loader-text">Loading your movie experience...</p> {/* Add custom text here */}
    </div>
  );
}

export default Loader;
