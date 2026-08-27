import { useState, useEffect } from "react";
import {useNavigate} from "react-router-dom";
import "./HomePage.css";

function HomePage() {
  const navigate = useNavigate();
  const [uploadedImage, setUploadedImage] = useState(null);
  const [numImages, setNumImages] = useState("");
  const [fileUploaded, setFileUploaded] = useState(false);

  useEffect(() => {
    // Note: Using in-memory storage instead of localStorage for Claude.ai compatibility
  }, []);

  const handleUpload = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setUploadedImage(null);
      setFileUploaded(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target.result);
      setFileUploaded(true);
    };
    reader.readAsDataURL(file);
  };

  const handleFinalize = (e) => {
    const n = parseInt(numImages);

    if (!fileUploaded) {
      e.preventDefault();
      alert("Error: no image has been uploaded.");
      return;
    }

    if (!n || n < 1) {
      e.preventDefault();
      alert("Error: please enter a valid number of images.");
      return;
    }

    // Navigate to EditPage with state
    navigate('/edit', { 
      state: { 
        uploadedImage: uploadedImage, 
        numImages: n 
      } 
    });
  };

  return (
    <div className="container">
      <nav className="home-navbar">
        <h1 className="home-banner">ScrolliTelli Creation Tool</h1>
      </nav>
      
      <div className="main-row">
        <div className="left-column">
          <div className="form-section">
            <label htmlFor="upload" className="form-label">
              Click here to upload an initial image:
            </label>
            <input
              id="upload"
              type="file"
              className="file-input"
              accept="image/*"
              onChange={handleUpload}
            />
          </div>

          <div className="options-div">
            <p className="text">How many slides would you like to start with?</p>
            <div className="selections">
              <input
                type="number"
                className="number-input"
                min="0"
                value={numImages}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || Number(val) >= 0) {
                    setNumImages(val);
                  }
                }}
              />

              <button
                onClick={handleFinalize}
                className={`btn ${!fileUploaded ? 'btn-disabled' : ''}`}
                disabled={!fileUploaded}
              >
                Move to image editor
              </button>
            </div>
          </div>
        </div>

        <div className="right-column">
          <div className="preview">
            <h3 className="img-label">{uploadedImage ? "Image preview" : "Image will appear here:"}</h3>
            <div className="image-container">
              {uploadedImage ? (
                <img
                  src={uploadedImage}
                  alt="Preview"
                  className="preview-image"
                />
              ) : (
                <p className="no-image-text">No image uploaded yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;