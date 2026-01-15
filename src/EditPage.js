import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./EditPage.css";


function SectionEditor({ index, initialImage, onUpdate, onDelete, onAdd, canDelete }) {
  const [imageSrc, setImageSrc] = useState(initialImage);
  const [currentShape, setCurrentShape] = useState(null);
  const [drawMode, setDrawMode] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [textContent, setTextContent] = useState("");
  const [blurAmount, setBlurAmount] = useState(2);
  const [deleted, setDeleted] = useState(false);

  const baseImgRef = useRef(null);
  const blurCanvasRef = useRef(null);
  const drawCanvasRef = useRef(null);
  const replaceInputRef = useRef(null);

  useEffect(() => {
    if (baseImgRef.current && baseImgRef.current.complete) {
      setupCanvases();
    }
  }, [imageSrc]);

  useEffect(() => {
    applyBlur();
  }, [blurAmount, currentShape]);

  useEffect(() => {
    onUpdate(index, {
      image: imageSrc,
      shape: currentShape,
      text: textContent,
      blurAmount: blurAmount,
      canvasWidth: blurCanvasRef.current?.width || 0,
      canvasHeight: blurCanvasRef.current?.height || 0,
    });
  }, [imageSrc, currentShape, textContent, blurAmount]);

  const setupCanvases = () => {
    if (!baseImgRef.current || !blurCanvasRef.current || !drawCanvasRef.current) return;

    const imgWidth = baseImgRef.current.width;
    const imgHeight = baseImgRef.current.height;

    blurCanvasRef.current.width = imgWidth;
    blurCanvasRef.current.height = imgHeight;
    drawCanvasRef.current.width = imgWidth;
    drawCanvasRef.current.height = imgHeight;

    applyBlur();
  };

  const applyBlur = () => {
    if (!blurCanvasRef.current || !baseImgRef.current) return;

    const canvas = blurCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const blur = blurAmount;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!currentShape) {
      ctx.filter = `blur(${blur}px)`;
      ctx.drawImage(baseImgRef.current, 0, 0, canvas.width, canvas.height);
      return;
    }

    ctx.save();
    ctx.filter = `blur(${blur}px)`;
    ctx.drawImage(baseImgRef.current, 0, 0, canvas.width, canvas.height);

    ctx.globalCompositeOperation = "destination-out";
    ctx.filter = "none";

    if (currentShape.type === "circle") {
      ctx.beginPath();
      ctx.arc(currentShape.x, currentShape.y, currentShape.radius, 0, 2 * Math.PI);
      ctx.fill();
    } else if (currentShape.type === "rectangle") {
      ctx.fillRect(currentShape.x, currentShape.y, currentShape.width, currentShape.height);
    }

    ctx.restore();
  };

  const handleMouseDown = (e) => {
    if (!drawMode) return;
    setIsDrawing(true);
    const rect = drawCanvasRef.current.getBoundingClientRect();
    setStartPos({
      x: (e.clientX - rect.left) * (drawCanvasRef.current.width / rect.width),
      y: (e.clientY - rect.top) * (drawCanvasRef.current.height / rect.height),
    });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !drawCanvasRef.current) return;

    const rect = drawCanvasRef.current.getBoundingClientRect();
    const currentX = (e.clientX - rect.left) * (drawCanvasRef.current.width / rect.width);
    const currentY = (e.clientY - rect.top) * (drawCanvasRef.current.height / rect.height);

    const ctx = drawCanvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, drawCanvasRef.current.width, drawCanvasRef.current.height);
    ctx.strokeStyle = "#00ff00";
    ctx.lineWidth = 2;
    ctx.beginPath();

    if (drawMode === "circle") {
      const radius = Math.sqrt(
        Math.pow(currentX - startPos.x, 2) + Math.pow(currentY - startPos.y, 2)
      );
      ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
    } else if (drawMode === "rectangle") {
      const width = currentX - startPos.x;
      const height = currentY - startPos.y;
      ctx.rect(startPos.x, startPos.y, width, height);
    }

    ctx.stroke();
  };

  const handleMouseUp = (e) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const rect = drawCanvasRef.current.getBoundingClientRect();
    const endX = (e.clientX - rect.left) * (drawCanvasRef.current.width / rect.width);
    const endY = (e.clientY - rect.top) * (drawCanvasRef.current.height / rect.height);

    if (drawMode === "circle") {
      const radius = Math.sqrt(
        Math.pow(endX - startPos.x, 2) + Math.pow(endY - startPos.y, 2)
      );
      setCurrentShape({
        type: "circle",
        x: startPos.x,
        y: startPos.y,
        radius: radius,
      });
    } else if (drawMode === "rectangle") {
      setCurrentShape({
        type: "rectangle",
        x: startPos.x,
        y: startPos.y,
        width: endX - startPos.x,
        height: endY - startPos.y,
      });
    }

    const ctx = drawCanvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, drawCanvasRef.current.width, drawCanvasRef.current.height);
  };

  const handleReplaceImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    if (window.confirm("Are you sure you want to remove the image from this section? This will create a text-only section.")) {
      setImageSrc(null);
      setCurrentShape(null);
    }
  };

  const handleDelete = () => {
    if (!canDelete) {
      window.alert("Cannot delete the last remaining section. At least one section must remain.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this section?")) {
      setDeleted(true);
      onDelete(index);
    }
  };

  if (deleted) return null;

  return (
    <div className="section-editor" style={{ marginBottom: "30px", border: "1px solid #ddd", padding: "20px", borderRadius: "8px" }}>
      <div style={{ marginBottom: "15px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3>Section {index + 1}</h3>
        <div>
          <button
            onClick={onAdd}
            style={{ marginLeft: "10px", padding: "8px 16px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            Add Section
          </button>
          <button
            onClick={handleDelete}
            style={{ marginLeft: "10px", padding: "8px 16px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            Delete Section
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
        <div>
          {imageSrc && (
            <div style={{ position: "relative", marginBottom: "15px" }}>
              <div style={{ position: "relative", display: "inline-block" }}>
                <img
                  ref={baseImgRef}
                  src={imageSrc}
                  alt={`Section ${index + 1}`}
                  onLoad={setupCanvases}
                  style={{ maxWidth: "100%", display: "block" }}
                />
                <canvas
                  ref={blurCanvasRef}
                  style={{ position: "absolute", top: 0, left: 0, maxWidth: "100%" }}
                />
                <canvas
                  ref={drawCanvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  style={{ position: "absolute", top: 0, left: 0, maxWidth: "100%", cursor: drawMode ? "crosshair" : "default" }}
                />
              </div>
            </div>
          )}

          <div style={{ marginBottom: "15px" }}>
            <button
              onClick={() => {
                setDrawMode("circle");
              }}
              style={{ marginRight: "10px", padding: "8px 16px", backgroundColor: drawMode === "circle" ? "#0056b3" : "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              Draw Circle
            </button>
            <button
              onClick={() => {
                setDrawMode("rectangle");
              }}
              style={{ marginRight: "10px", padding: "8px 16px", backgroundColor: drawMode === "rectangle" ? "#0056b3" : "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              Draw Rectangle
            </button>
            <button
              onClick={() => {
                setCurrentShape(null);
                setDrawMode(null);
              }}
              style={{ marginRight: "10px", padding: "8px 16px", backgroundColor: "#ffc107", color: "black", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              Clear Shape
            </button>
            <button
              onClick={() => replaceInputRef.current.click()}
              style={{ marginRight: "10px", padding: "8px 16px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              Replace Image
            </button>
            <button
              onClick={handleRemoveImage}
              style={{ padding: "8px 16px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              Remove Image
            </button>
            <input
              ref={replaceInputRef}
              type="file"
              accept="image/*"
              onChange={handleReplaceImage}
              style={{ display: "none" }}
            />
          </div>

          {imageSrc && (
            <div style={{ marginBottom: "15px" }}>
              <label>Blur Strength: </label>
              <input
                type="range"
                min="0"
                max="20"
                step="0.5"
                value={blurAmount}
                onChange={(e) => setBlurAmount(parseFloat(e.target.value))}
                style={{ width: "200px", marginLeft: "10px" }}
              />
              <span style={{ marginLeft: "10px" }}>{blurAmount}</span>
            </div>
          )}
        </div>

        <div>
          <h4>Text Content</h4>
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Enter the text that will be revealed as users scroll through this section..."
            style={{ width: "100%", minHeight: "200px", padding: "10px", borderRadius: "4px", border: "1px solid #ddd" }}
          />
        </div>
      </div>
    </div>
  );
}

function EditPage() {
  const [sections, setSections] = useState();
  const location = useLocation();
  const navigate = useNavigate();
  const { uploadedImage, numImages } = location.state || {};

  useEffect(() => {
    const { uploadedImage, numImages } = location.state || {};
    const initialSections = Array.from({ length: numImages }, (_, index) => ({
      id: index,
      image: uploadedImage,
      data: null
    }));

    setSections(initialSections);
  }, [uploadedImage, numImages, navigate, location.state]);

  const handleSectionUpdate = (index, data) => {
    setSections((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], data };
      return updated;
    });
  };

  const handleSectionDelete = (index) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSection = (index) => {
    const currentSection = sections[index];
    const newSection = {
      id: Date.now(), // Use timestamp for unique ID
      image: currentSection?.data?.image || currentSection?.image,
      data: null,
    };
    setSections((prev) => {
      const updated = [...prev];
      updated.splice(index + 1, 0, newSection); // Insert after the current index
      return updated;
    });
  };

  const exportToHTML = () => {
    const activeSections = sections.filter((s) => s.data);
    if (activeSections.length === 0) {
      window.alert("Cannot export: no sections with data. Please add content to at least one section.");
      return;
    }

    const sectionsData = activeSections.map((s) => s.data);
    const presentationTitle = window.prompt("Enter a name for your presentation:", "My ScrolliTelli Story");
    const finalTitle = presentationTitle && presentationTitle.trim() ? presentationTitle.trim() : "ScrolliTelli Presentation";

    const escapeHtml = (text) => {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    };

    let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(finalTitle)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: auto; }
    body { font-family: Arial, sans-serif; background-color: #000; color: white; overflow-x: hidden; }
    .scroll-container { position: relative; }
    .image-container { position: fixed; top: 0; left: 0; width: 66.666%; height: 100vh; display: flex; justify-content: center; align-items: center; z-index: 1; background-color: #000; }
    .image-wrapper { position: relative; width: 90%; max-width: 100%; max-height: 90vh; }
    .image-wrapper img, .image-wrapper canvas { display: block; width: 100%; height: auto; max-height: 90vh; object-fit: contain; }
    .blur-canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; transition: opacity 0.3s ease; }
    .blur-canvas.active { opacity: 1; }
    .text-sections { position: relative; z-index: 10; pointer-events: none; margin-left: 66.666%; width: 33.333%; }
    .text-section { min-height: 80vh; display: flex; align-items: center; padding: 40px 30px; pointer-events: auto; }
    .text-content { width: 100%; background: rgba(0, 0, 0, 0.85); padding: 30px; border-radius: 8px; font-size: 18px; line-height: 1.8; white-space: pre-wrap; word-wrap: break-word; overflow-wrap: break-word; backdrop-filter: blur(10px); }
    .transition-spacer { height: 60vh; pointer-events: none; }
    @media (max-width: 1024px) {
      .image-container { width: 100%; height: 50vh; }
      .image-wrapper { width: 80%; }
      .text-sections { margin-left: 0; width: 100%; margin-top: 50vh; }
      .text-content { width: 90%; margin: 0 auto; font-size: 16px; }
    }
  </style>
</head>
<body>
  <div class="scroll-container">
    <div class="image-container">
      <div class="image-wrapper">
        <img src="${sectionsData[0]?.image || ""}" alt="Story image" id="base-image">
`;

    sectionsData.forEach((data, index) => {
      if (data.image) {
        htmlContent += `        <canvas id="canvas-${index}" class="blur-canvas"></canvas>\n`;
      }
    });

    htmlContent += `      </div>
    </div>
    <div class="text-sections">
`;

    sectionsData.forEach((data, index) => {
      htmlContent += `      <div class="text-section" data-section="${index}">
        <div class="text-content">${escapeHtml(data.text)}</div>
      </div>
`;
      if (index < sectionsData.length - 1) {
        htmlContent += `      <div class="transition-spacer" data-transition="${index}"></div>\n`;
      }
    });

    htmlContent += `    </div>
  </div>
  <script>
    const sectionsData = ${JSON.stringify(sectionsData)};
    const baseImage = document.getElementById('base-image');
    const canvases = [];
    
    sectionsData.forEach((data, index) => {
      if (data.image) {
        const canvas = document.getElementById('canvas-' + index);
        canvases.push({ canvas, index });
      }
    });

    const sectionImages = sectionsData.map(data => {
      if (!data.image) return null;
      const img = new Image();
      img.src = data.image;
      return img;
    });

    function renderCanvasForSection(index) {
      const data = sectionsData[index];
      if (!data.image) return;
      const img = sectionImages[index];
      const canvasObj = canvases.find(c => c.index === index);
      if (!canvasObj || !img) return;
      const canvas = canvasObj.canvas;
      const ctx = canvas.getContext('2d');
      const renderWidth = img.width || baseImage.width;
      const renderHeight = img.height || baseImage.height;
      if (!renderWidth || !renderHeight) return;
      canvas.width = renderWidth;
      canvas.height = renderHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!data.shape) {
        ctx.filter = 'blur(' + data.blurAmount + 'px)';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      } else {
        const scaleX = renderWidth / data.canvasWidth;
        const scaleY = renderHeight / data.canvasHeight;
        ctx.save();
        ctx.filter = 'blur(' + data.blurAmount + 'px)';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.filter = 'none';
        if (data.shape.type === 'circle') {
          ctx.beginPath();
          ctx.arc(data.shape.x * scaleX, data.shape.y * scaleY, data.shape.radius * scaleX, 0, 2 * Math.PI);
          ctx.fill();
        } else if (data.shape.type === 'rectangle') {
          ctx.fillRect(data.shape.x * scaleX, data.shape.y * scaleY, data.shape.width * scaleX, data.shape.height * scaleY);
        }
        ctx.restore();
      }
    }

    sectionImages.forEach((img, index) => {
      if (!img) return;
      if (img.complete) {
        renderCanvasForSection(index);
      } else {
        img.onload = () => renderCanvasForSection(index);
      }
    });

    function updateActiveSection() {
      const spacers = document.querySelectorAll(".transition-spacer");
      const imageContainer = document.querySelector(".image-container");
      const imageRect = imageContainer.getBoundingClientRect();
      const imageMid = imageRect.top + imageRect.height / 2;
      let activeSection = 0;
      spacers.forEach((spacer, index) => {
        const rect = spacer.getBoundingClientRect();
        const spacerBottom = rect.top + rect.height;
        if (spacerBottom < imageMid) {
          activeSection = index + 1;
        }
      });
      canvases.forEach((canvasObj) => {
        if (canvasObj.index === activeSection) {
          canvasObj.canvas.classList.add("active");
        } else {
          canvasObj.canvas.classList.remove("active");
        }
      });
      if (sectionsData[activeSection] && sectionsData[activeSection].image) {
        baseImage.src = sectionsData[activeSection].image;
        baseImage.style.display = "block";
      } else if (sectionsData[activeSection] && !sectionsData[activeSection].image) {
        baseImage.style.display = "none";
      }
    }
    
    window.addEventListener('scroll', updateActiveSection);
    window.addEventListener('resize', () => {
      sectionImages.forEach((img, index) => {
        if (img) renderCanvasForSection(index);
      });
      updateActiveSection();
    });

    if (canvases.length > 0) {
      canvases[0].canvas.classList.add('active');
    }
    if (sectionsData[0] && sectionsData[0].image) {
      baseImage.src = sectionsData[0].image;
      baseImage.style.display = "block";
    } else if (sectionsData[0] && !sectionsData[0].image) {
      baseImage.style.display = "none";
    }
    updateActiveSection();
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const filename = finalTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "scrollitelli-presentation";
    a.download = filename + ".html";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "1400px", margin: "0 auto", padding: "20px" }}>
      <nav style={{ backgroundColor: "#333", color: "white", padding: "20px", marginBottom: "30px", borderRadius: "8px" }}>
        <h1>ScrolliTelli Creation Tool - Edit Your Story</h1>
      </nav>

      <div>
        {sections && sections.map((section, index) => (
          <SectionEditor
            key={section.id}
            index={index}
            initialImage={section.image}
            onUpdate={handleSectionUpdate}
            onDelete={handleSectionDelete}
            onAdd={() => handleAddSection(index)}
            canDelete={sections.length > 1}
          />
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: "40px", padding: "30px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
        <h3>Ready to Export?</h3>
        <p style={{ marginBottom: "20px" }}>
          Once exported, your presentation will feature smooth scrolling where images stay fixed while text reveals, then transitions to the next image.
        </p>
        <button
          onClick={exportToHTML}
          style={{ padding: "15px 40px", fontSize: "18px", backgroundColor: "#343a40", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          Export as HTML
        </button>
      </div>
    </div>
  );
}

export default EditPage;