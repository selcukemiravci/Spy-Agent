import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';

interface TargetUploadProps {
  onUpload: (file: File) => void;
}

export const TargetUpload: React.FC<TargetUploadProps> = ({ onUpload }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onUpload(file);
    }
  };

  const clearPreview = () => {
    setPreview(null);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Target Recognition</h3>
      {!preview ? (
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Drag and drop target image or{' '}
            <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
              browse
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleChange}
              />
            </label>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Supported formats: JPG, PNG, GIF
          </p>
        </div>
      ) : (
        <div className="relative">
          <img
            src={preview}
            alt="Target preview"
            className="w-full h-48 object-cover rounded-lg"
          />
          <button
            onClick={clearPreview}
            className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="text-sm text-gray-600 mt-2">Target image uploaded</p>
        </div>
      )}
    </div>
  );
};