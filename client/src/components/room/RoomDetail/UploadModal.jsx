import React, { useState } from 'react';
import { FaFile, FaImage, FaFilePdf, FaTimes } from 'react-icons/fa';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';

const UploadModal = ({ isOpen, onClose, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile.type, selectedFile);
      setSelectedFile(null);
      onClose();
    }
  };

  const getFileIcon = () => {
    if (!selectedFile) return FaFile;
    if (selectedFile.type.startsWith('image/')) return FaImage;
    if (selectedFile.type === 'application/pdf') return FaFilePdf;
    return FaFile;
  };

  const FileIcon = getFileIcon();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Material">
      <div className="space-y-6">
        {/* Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center transition
            ${dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}
          `}
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <FileIcon className="text-3xl text-primary-600" />
            </div>
          </div>
          
          <p className="text-gray-700 font-medium mb-2">
            {selectedFile ? selectedFile.name : 'Drag and drop or click to browse'}
          </p>
          
          {selectedFile && (
            <p className="text-sm text-gray-500 mb-4">
              {(selectedFile.size / 1024).toFixed(2)} KB
            </p>
          )}
          
          <input
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          
          {!selectedFile && (
            <label
              htmlFor="file-upload"
              className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer transition"
            >
              Browse Files
            </label>
          )}
        </div>

        {/* File Preview */}
        {selectedFile && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileIcon className="text-2xl text-primary-600" />
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!selectedFile}>
            Share
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default UploadModal;