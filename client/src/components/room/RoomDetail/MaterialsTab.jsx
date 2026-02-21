import React from 'react';
import { FaPlus, FaFile, FaImage, FaFilePdf, FaFileWord, FaFileExcel, FaDownload } from 'react-icons/fa';
import Button from '../../ui/Button';
import { formatDistanceToNow } from 'date-fns';

const MaterialsTab = ({ materials, onUploadClick }) => {
  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return FaImage;
    if (type === 'application/pdf') return FaFilePdf;
    if (type.includes('word')) return FaFileWord;
    if (type.includes('excel') || type.includes('sheet')) return FaFileExcel;
    return FaFile;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="p-4">
      {/* Upload Button */}
      <Button
        onClick={onUploadClick}
        className="w-full mb-4 flex items-center justify-center space-x-2"
      >
        <FaPlus size={14} />
        <span>Share Material</span>
      </Button>

      {/* Materials List */}
      <div className="space-y-2">
        {materials.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <FaFile className="mx-auto text-4xl mb-3 opacity-50" />
            <p className="text-sm">No materials shared yet</p>
            <p className="text-xs mt-1">Be the first to share something!</p>
          </div>
        ) : (
          materials.map((material) => {
            const FileIcon = getFileIcon(material.type);
            return (
              <div
                key={material.id}
                className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition cursor-pointer group"
              >
                <div className="text-primary-400">
                  <FileIcon size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {material.name}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <span>{material.username}</span>
                    <span>·</span>
                    <span>{formatFileSize(material.size)}</span>
                    <span>·</span>
                    <span>
                      {formatDistanceToNow(new Date(material.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition">
                  <FaDownload size={16} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MaterialsTab;