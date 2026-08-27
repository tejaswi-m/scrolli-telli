import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./EditPage.css";

<<<<<<< HEAD
=======
const escapeHtml = (text) => {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};

// Only these tags are allowed to survive from a contentEditable field (typing,
// our own Bold/Italic/Link insertions, or a pasted-as-plain-text paste never
// produce anything else, but this is a defense-in-depth pass regardless).
const ALLOWED_RICH_TEXT_TAGS = new Set(["B", "STRONG", "I", "EM", "A", "BR", "DIV", "P"]);

const sanitizeRichText = (html) => {
  const template = document.createElement("template");
  template.innerHTML = html || "";

  const clean = (parent) => {
    Array.from(parent.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) return;
      if (node.nodeType !== Node.ELEMENT_NODE) {
        node.remove();
        return;
      }

      clean(node);

      if (!ALLOWED_RICH_TEXT_TAGS.has(node.tagName)) {
        while (node.firstChild) parent.insertBefore(node.firstChild, node);
        parent.removeChild(node);
        return;
      }

      const href = node.tagName === "A" ? node.getAttribute("href") : null;
      Array.from(node.attributes).forEach((attr) => node.removeAttribute(attr.name));

      if (node.tagName === "A") {
        if (href && /^(https?:|mailto:)/i.test(href.trim())) {
          node.setAttribute("href", href.trim());
          node.setAttribute("target", "_blank");
          node.setAttribute("rel", "noopener noreferrer");
        } else {
          while (node.firstChild) parent.insertBefore(node.firstChild, node);
          parent.removeChild(node);
        }
      }
    });
  };

  clean(template.content);
  return template.innerHTML;
};
>>>>>>> 714a100 (Tamara's feedback changes)

function SectionEditor({ index, initialImage, onUpdate, onDelete, onAdd, canDelete }) {
  const [imageSrc, setImageSrc] = useState(initialImage);
  const [currentShape, setCurrentShape] = useState(null);
  const [drawMode, setDrawMode] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [textContent, setTextContent] = useState("");
  const [blurAmount, setBlurAmount] = useState(2);
  const [deleted, setDeleted] = useState(false);
<<<<<<< HEAD
=======
  const [showEnlarged, setShowEnlarged] = useState(false);
  const [modalZoom, setModalZoom] = useState(2);
>>>>>>> 714a100 (Tamara's feedback changes)

  const baseImgRef = useRef(null);
  const blurCanvasRef = useRef(null);
  const drawCanvasRef = useRef(null);
  const replaceInputRef = useRef(null);
<<<<<<< HEAD
=======
  const modalCanvasRef = useRef(null);
  const modalContainerRef = useRef(null);
  const editableRef = useRef(null);

  const MIN_MODAL_ZOOM = 1;
  const MAX_MODAL_ZOOM = 6;

  const syncTextFromEditable = () => {
    const editable = editableRef.current;
    if (!editable) return;
    setTextContent(editable.innerHTML);
  };

  const getEditableSelectionRange = () => {
    const editable = editableRef.current;
    const sel = window.getSelection();
    if (!editable || !sel || sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0);
    if (!editable.contains(range.commonAncestorContainer)) return null;
    return { sel, range };
  };

  const placeCaretAfter = (sel, node) => {
    const newRange = document.createRange();
    newRange.setStartAfter(node);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);
  };

  const handleInlineFormat = (type) => {
    const editable = editableRef.current;
    if (!editable) return;
    editable.focus();
    const info = getEditableSelectionRange();
    if (!info) return;
    const { sel, range } = info;

    const el = document.createElement(type === "bold" ? "strong" : "em");
    if (range.collapsed) {
      el.textContent = type === "bold" ? "bold text" : "italic text";
      range.insertNode(el);
      const newRange = document.createRange();
      newRange.selectNodeContents(el);
      sel.removeAllRanges();
      sel.addRange(newRange);
    } else {
      const contents = range.extractContents();
      el.appendChild(contents);
      range.insertNode(el);
      placeCaretAfter(sel, el);
    }

    syncTextFromEditable();
  };

  const handleInsertLink = () => {
    const editable = editableRef.current;
    if (!editable) return;
    editable.focus();
    const info = getEditableSelectionRange();
    if (!info) return;
    const { sel, range } = info;

    const url = window.prompt("Enter the URL:", "https://");
    if (!url) return;
    const trimmed = url.trim();
    if (!/^(https?:|mailto:)/i.test(trimmed)) {
      window.alert("Please enter a URL starting with http://, https://, or mailto:");
      return;
    }

    const a = document.createElement("a");
    a.href = trimmed;
    a.target = "_blank";
    a.rel = "noopener noreferrer";

    if (range.collapsed) {
      a.textContent = "link text";
      range.insertNode(a);
    } else {
      const contents = range.extractContents();
      a.appendChild(contents);
      range.insertNode(a);
    }
    placeCaretAfter(sel, a);

    syncTextFromEditable();
  };

  const handleEditablePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    const info = getEditableSelectionRange();
    if (!info) return;
    const { sel, range } = info;
    range.deleteContents();
    const textNode = document.createTextNode(text);
    range.insertNode(textNode);
    const newRange = document.createRange();
    newRange.setStartAfter(textNode);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);
    syncTextFromEditable();
  };

  const handleEditableBlur = () => {
    const editable = editableRef.current;
    if (!editable) return;
    const sanitized = sanitizeRichText(editable.innerHTML);
    if (sanitized !== editable.innerHTML) {
      editable.innerHTML = sanitized;
    }
    setTextContent(sanitized);
  };
>>>>>>> 714a100 (Tamara's feedback changes)

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

<<<<<<< HEAD
=======
  const renderModalCanvas = () => {
    requestAnimationFrame(() => {
      if (!modalCanvasRef.current || !baseImgRef.current || !blurCanvasRef.current || !currentShape) return;

      const displayWidth = blurCanvasRef.current.width;
      const displayHeight = blurCanvasRef.current.height;
      const naturalWidth = baseImgRef.current.naturalWidth || displayWidth;
      const naturalHeight = baseImgRef.current.naturalHeight || displayHeight;
      const scaleX = naturalWidth / displayWidth;
      const scaleY = naturalHeight / displayHeight;

      // Bounding box of the selected shape, in natural image pixel space.
      let boxX, boxY, boxW, boxH;
      if (currentShape.type === "circle") {
        boxX = (currentShape.x - currentShape.radius) * scaleX;
        boxY = (currentShape.y - currentShape.radius) * scaleY;
        boxW = currentShape.radius * 2 * scaleX;
        boxH = currentShape.radius * 2 * scaleY;
      } else {
        boxX = Math.min(currentShape.x, currentShape.x + currentShape.width) * scaleX;
        boxY = Math.min(currentShape.y, currentShape.y + currentShape.height) * scaleY;
        boxW = Math.abs(currentShape.width) * scaleX;
        boxH = Math.abs(currentShape.height) * scaleY;
      }

      // Clamp the crop box to the image bounds.
      const srcX = Math.max(0, boxX);
      const srcY = Math.max(0, boxY);
      const srcW = Math.min(boxW, naturalWidth - srcX);
      const srcH = Math.min(boxH, naturalHeight - srcY);
      if (srcW <= 0 || srcH <= 0) return;

      const canvas = modalCanvasRef.current;
      canvas.width = Math.round(srcW * modalZoom);
      canvas.height = Math.round(srcH * modalZoom);

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();

      if (currentShape.type === "circle") {
        ctx.beginPath();
        ctx.ellipse(canvas.width / 2, canvas.height / 2, canvas.width / 2, canvas.height / 2, 0, 0, 2 * Math.PI);
        ctx.clip();
      }

      ctx.drawImage(baseImgRef.current, srcX, srcY, srcW, srcH, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      if (modalContainerRef.current) {
        const container = modalContainerRef.current;
        container.scrollLeft = Math.max(0, (canvas.width - container.clientWidth) / 2);
        container.scrollTop = Math.max(0, (canvas.height - container.clientHeight) / 2);
      }
    });
  };

  useEffect(() => {
    if (showEnlarged) {
      renderModalCanvas();
    }
  }, [showEnlarged, modalZoom, currentShape]);

  const handleOpenEnlarged = () => {
    if (!currentShape) return;
    setModalZoom(2);
    setShowEnlarged(true);
  };

  const handleZoomIn = () => {
    setModalZoom((z) => Math.min(MAX_MODAL_ZOOM, +(z + 0.5).toFixed(1)));
  };

  const handleZoomOut = () => {
    setModalZoom((z) => Math.max(MIN_MODAL_ZOOM, +(z - 0.5).toFixed(1)));
  };

>>>>>>> 714a100 (Tamara's feedback changes)
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
<<<<<<< HEAD
=======
      setDrawMode(null);
      setShowEnlarged(false);
      setBlurAmount(2);
>>>>>>> 714a100 (Tamara's feedback changes)
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

<<<<<<< HEAD
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
        <div>
          {imageSrc && (
            <div style={{ position: "relative", marginBottom: "15px" }}>
              <div style={{ position: "relative", display: "inline-block" }}>
=======
      <div style={{ display: "grid", gridTemplateColumns: imageSrc ? "2fr 1fr" : "1fr", gap: "20px" }}>
        <div>
          {imageSrc && (
            <div style={{ position: "relative", marginBottom: "15px" }}>
              <div
                style={{ position: "relative", display: "inline-block" }}
                onClick={() => {
                  if (!drawMode) handleOpenEnlarged();
                }}
                title={currentShape ? "Click to view selected area" : ""}
              >
>>>>>>> 714a100 (Tamara's feedback changes)
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
<<<<<<< HEAD
                  style={{ position: "absolute", top: 0, left: 0, maxWidth: "100%", cursor: drawMode ? "crosshair" : "default" }}
=======
                  style={{ position: "absolute", top: 0, left: 0, maxWidth: "100%", cursor: drawMode ? "crosshair" : (currentShape ? "zoom-in" : "default") }}
>>>>>>> 714a100 (Tamara's feedback changes)
                />
              </div>
            </div>
          )}

          <div style={{ marginBottom: "15px" }}>
<<<<<<< HEAD
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
=======
            {imageSrc && (
              <>
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
                  onClick={handleOpenEnlarged}
                  disabled={!currentShape}
                  style={{ marginRight: "10px", padding: "8px 16px", backgroundColor: currentShape ? "#17a2b8" : "#adb5bd", color: "white", border: "none", borderRadius: "4px", cursor: currentShape ? "pointer" : "not-allowed" }}
                >
                  View Selected Area
                </button>
              </>
            )}
>>>>>>> 714a100 (Tamara's feedback changes)
            <button
              onClick={() => replaceInputRef.current.click()}
              style={{ marginRight: "10px", padding: "8px 16px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
<<<<<<< HEAD
              Replace Image
            </button>
            <button
              onClick={handleRemoveImage}
              style={{ padding: "8px 16px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              Remove Image
            </button>
=======
              {imageSrc ? "Replace Image" : "Add Image"}
            </button>
            {imageSrc && (
              <button
                onClick={handleRemoveImage}
                style={{ padding: "8px 16px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
              >
                Remove Image
              </button>
            )}
>>>>>>> 714a100 (Tamara's feedback changes)
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

<<<<<<< HEAD
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
=======
        <div style={imageSrc ? undefined : { maxWidth: "900px", margin: "0 auto", width: "100%" }}>
          <h4 style={imageSrc ? undefined : { textAlign: "center" }}>Text Content</h4>

          <div style={{ marginBottom: "6px", display: "flex", gap: "6px" }}>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleInlineFormat("bold"); }}
              title="Bold"
              style={{ width: "32px", height: "32px", fontWeight: "bold", backgroundColor: "#e9ecef", border: "1px solid #ced4da", borderRadius: "4px", cursor: "pointer" }}
            >
              B
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleInlineFormat("italic"); }}
              title="Italic"
              style={{ width: "32px", height: "32px", fontStyle: "italic", backgroundColor: "#e9ecef", border: "1px solid #ced4da", borderRadius: "4px", cursor: "pointer" }}
            >
              I
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleInsertLink(); }}
              title="Insert link"
              style={{ height: "32px", padding: "0 10px", backgroundColor: "#e9ecef", border: "1px solid #ced4da", borderRadius: "4px", cursor: "pointer" }}
            >
              🔗 Link
            </button>
          </div>

          <div style={{ position: "relative" }}>
            {!textContent && (
              <div style={{ position: "absolute", top: "10px", left: "10px", color: "#999", pointerEvents: "none" }}>
                Enter the text that will be revealed as users scroll through this section...
              </div>
            )}
            <div
              ref={editableRef}
              contentEditable
              suppressContentEditableWarning
              onInput={syncTextFromEditable}
              onPaste={handleEditablePaste}
              onBlur={handleEditableBlur}
              style={{ width: "100%", minHeight: "200px", padding: "10px", borderRadius: "4px", border: "1px solid #ddd", backgroundColor: "white", outline: "none" }}
            />
          </div>
        </div>
      </div>

      {showEnlarged && (
        <div
          onClick={() => setShowEnlarged(false)}
          style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center" }}
        >
          <button
            onClick={() => setShowEnlarged(false)}
            style={{ position: "fixed", top: "20px", right: "30px", fontSize: "28px", lineHeight: 1, background: "none", border: "none", color: "white", cursor: "pointer", zIndex: 1001 }}
            aria-label="Close selected area view"
          >
            &times;
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            style={{ position: "fixed", bottom: "30px", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: "10px", backgroundColor: "rgba(255,255,255,0.95)", padding: "8px 14px", borderRadius: "8px", zIndex: 1001 }}
          >
            <button
              onClick={handleZoomOut}
              disabled={modalZoom <= MIN_MODAL_ZOOM}
              style={{ width: "36px", height: "36px", fontSize: "20px", lineHeight: 1, backgroundColor: modalZoom <= MIN_MODAL_ZOOM ? "#adb5bd" : "#343a40", color: "white", border: "none", borderRadius: "4px", cursor: modalZoom <= MIN_MODAL_ZOOM ? "not-allowed" : "pointer" }}
              aria-label="Zoom out"
            >
              &minus;
            </button>
            <span style={{ minWidth: "48px", textAlign: "center", fontWeight: "bold" }}>{modalZoom.toFixed(1)}x</span>
            <button
              onClick={handleZoomIn}
              disabled={modalZoom >= MAX_MODAL_ZOOM}
              style={{ width: "36px", height: "36px", fontSize: "20px", lineHeight: 1, backgroundColor: modalZoom >= MAX_MODAL_ZOOM ? "#adb5bd" : "#343a40", color: "white", border: "none", borderRadius: "4px", cursor: modalZoom >= MAX_MODAL_ZOOM ? "not-allowed" : "pointer" }}
              aria-label="Zoom in"
            >
              +
            </button>
          </div>

          <div
            ref={modalContainerRef}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "90vw", maxHeight: "90vh", overflow: "auto" }}
          >
            <canvas
              ref={modalCanvasRef}
              style={{ display: "block" }}
            />
          </div>
        </div>
      )}
>>>>>>> 714a100 (Tamara's feedback changes)
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

<<<<<<< HEAD
    const escapeHtml = (text) => {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    };

=======
>>>>>>> 714a100 (Tamara's feedback changes)
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
<<<<<<< HEAD
    .text-content { width: 100%; background: rgba(0, 0, 0, 0.85); padding: 30px; border-radius: 8px; font-size: 18px; line-height: 1.8; white-space: pre-wrap; word-wrap: break-word; overflow-wrap: break-word; backdrop-filter: blur(10px); }
=======
    .text-content { width: 100%; background: rgba(0, 0, 0, 0.85); padding: 30px; border-radius: 8px; font-size: 18px; line-height: 1.8; word-wrap: break-word; overflow-wrap: break-word; backdrop-filter: blur(10px); }
    .text-content a { color: #66b3ff; }
    .text-content div, .text-content p { min-height: 1em; }
>>>>>>> 714a100 (Tamara's feedback changes)
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
<<<<<<< HEAD
        <div class="text-content">${escapeHtml(data.text)}</div>
=======
        <div class="text-content">${sanitizeRichText(data.text)}</div>
>>>>>>> 714a100 (Tamara's feedback changes)
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