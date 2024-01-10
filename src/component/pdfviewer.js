import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Document, Page, pdfjs } from "react-pdf";
import "./style.css";
import "bootstrap/dist/css/bootstrap.min.css";

// define worker source for pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// file drop zone component
const FileDropZone = ({ onFileDrop }) => {
  // for handling dropped files
  const onDrop = (acceptedFiles) => {
    onFileDrop(acceptedFiles);
  };

  //dropzone functionality
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

// pdf viewer and text extractor conpoment
const PdfViewerAndTextExtractor = () => {
  // state variable
  const [pdfFile, setPdfFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [fileName, setFileName] = useState("");
  const [selectedOptions, setSelectedOptions] = useState([]);

  // file drop zone handler
  const onFileDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.size <= 200 * 1024 * 1024) {
      setPdfFile(URL.createObjectURL(file));
      setFileName(file.name);
      const initialOptions = new Array(numPages).fill(0);
      setSelectedOptions(initialOptions);
    } else {
      alert("Please upload a file up to 200MB.");
    }
  };
  // pdf doc load success
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  // Handle option change for each page
  const handleOptionChange = (pageNum, option) => {
    const updatedOptions = [...selectedOptions];
    updatedOptions[pageNum - 1] = option;
    setSelectedOptions(updatedOptions);
  };

  // Remove uploaded file and reset state
  const removeUploadedFile = () => {
    setPdfFile(null);
    setNumPages(null);
    setFileName("");
    setSelectedOptions([]);
  };
//  render the websirte
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
                <div className="pdf-page">
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    scale={0.5}
                  />
                </div>
                <div className="radio-options">
                  <input
                    type="radio"
                    id={`selectImage_${index}`}
                    name={`options_${index}`}
                    value="selectImage"
                    checked={selectedOptions[index] === 3}
                    onChange={() => handleOptionChange(index + 1, 3)}
                  />
                  <label htmlFor={`selectImage_${index}`}>Select Image</label>
                  <br />
                  <input
                    type="radio"
                    id={`noText_${index}`}
                    name={`options_${index}`}
                    value="noText"
                    checked={selectedOptions[index] === 0}
                    onChange={() => handleOptionChange(index + 1, 0)}
                  />
                  <label htmlFor={`noText_${index}`}>No Text</label>
                  <br />

                  <input
                    type="radio"
                    id={`useExtractedText_${index}`}
                    name={`options_${index}`}
                    value="useExtractedText"
                    checked={selectedOptions[index] === 1}
                    onChange={() => handleOptionChange(index + 1, 1)}
                  />
                  <label htmlFor={`useExtractedText_${index}`}>
                    Use Extracted Text
                  </label>
                  <br />

                  <br />
                </div>
              </div>
            ))}
          </Document>
        </div>
      )}
    </div>
  );
};

export default PdfViewerAndTextExtractor;