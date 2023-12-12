import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Document, Page, pdfjs } from "react-pdf";
import "./style.css";
import "bootstrap/dist/css/bootstrap.min.css";

// Your PDF.js worker source
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const FileDropZone = ({ onFileDrop }) => {
  const onDrop = (acceptedFiles) => {
    onFileDrop(acceptedFiles);
  };

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
  });

  return (
    <div {...getRootProps()} className="dropzone-style">
      <input {...getInputProps()} />
      <div className="upload-logo">
        <img
          src="https://cdn-icons-png.flaticon.com/512/564/564793.png"
          alt="Upload Icon"
        />
      </div>
      <p>
        Drag and drop a file here <br /> (max size: 200MB)
      </p>
      <button className="upload-btn" type="button" onClick={open}>
        Browse File
      </button>
    </div>
  );
};

const PdfViewerAndTextExtractor = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [extractedText, setExtractedText] = useState([]);
  const [displayText, setDisplayText] = useState(false);
  const [fileName, setFileName] = useState("");
  const [selectedOptions, setSelectedOptions] = useState([]);

  const onFileDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.size <= 200 * 1024 * 1024) {
      setPdfFile(URL.createObjectURL(file));
      setDisplayText(false);
      setFileName(file.name);
      const initialOptions = new Array(numPages).fill(0);
      setSelectedOptions(initialOptions);
    } else {
      alert("Please upload a file up to 200MB.");
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setExtractedText(new Array(numPages).fill(""));
  };

  const extractTextFromPDF = async () => {
    if (!pdfFile) return;

    const loadingTask = pdfjs.getDocument(pdfFile);
    const pdf = await loadingTask.promise;

    let allExtractedText = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const text = textContent.items.map((textItem) => textItem.str).join(" ");

      allExtractedText.push(text);
    }

    setExtractedText(allExtractedText);
  };

  const toggleDisplayText = () => {
    setDisplayText(!displayText);

    if (!displayText) {
      extractTextFromPDF();
    }
  };

  const handleOptionChange = (pageNum, option) => {
    const updatedOptions = [...selectedOptions];
    updatedOptions[pageNum - 1] = option;
    setSelectedOptions(updatedOptions);
  };

  const removeUploadedFile = () => {
    setPdfFile(null);
    setNumPages(null);
    setExtractedText([]);
    setFileName("");
    setSelectedOptions([]);
  };

  return (
    <div className="container">
      <h1>PDF Viewer and Text Extractor</h1>
      <h6>Upload Your File Here</h6>
      <FileDropZone onFileDrop={onFileDrop} />
      {fileName && (
        <div className="file-info">
          <p>Uploaded File: {fileName}</p>
          <button className="btn btn-danger" onClick={removeUploadedFile}>
            Remove File
          </button>
        </div>
      )}
      {pdfFile && (
        <div className="pdf-viewer">
          <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
            {Array.from(new Array(numPages), (el, index) => (
              <div key={`page_${index + 1}`}>
                <Page key={`page_${index + 1}`} pageNumber={index + 1} scale={0.5} />
                <div className="radio-options">
                  <input
                    type="radio"
                    id={`noText_${index}`}
                    name={`options_${index}`}
                    value="noText"
                    checked={selectedOptions[index] === 0}
                    onChange={() => handleOptionChange(index + 1, 0)}
                  />
                  <label htmlFor={`noText_${index}`}>No Text</label>

                  <input
                    type="radio"
                    id={`useExtractedText_${index}`}
                    name={`options_${index}`}
                    value="useExtractedText"
                    checked={selectedOptions[index] === 1}
                    onChange={() => handleOptionChange(index + 1, 1)}
                  />
                  <label htmlFor={`useExtractedText_${index}`}>Use Extracted Text</label>

                  <input
                    type="radio"
                    id={`customPrompt_${index}`}
                    name={`options_${index}`}
                    value="customPrompt"
                    checked={selectedOptions[index] === 2}
                    onChange={() => handleOptionChange(index + 1, 2)}
                  />
                  <label htmlFor={`customPrompt_${index}`}>Use Custom Prompt</label>
                </div>
              </div>
            ))}
          </Document>
        </div>
      )}
      {pdfFile && !displayText && (
        <div className="text-extraction">
          <input
            type="radio"
            id="displayText"
            name="displayText"
            value="displayText"
            checked={displayText}
            onChange={toggleDisplayText}
          />
          <label htmlFor="displayText">Display Extracted Text</label>
        </div>
      )}
      {displayText && (
        <div className="extracted-text">
          {extractedText.map((text, index) => (
            <div key={`text_${index}`}>
              <p>Page {index + 1} Text:</p>
              <p>{text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PdfViewerAndTextExtractor;
