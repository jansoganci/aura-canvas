import React, { useState, useRef, useCallback } from 'react';

interface ImageUploaderProps {
  onImageUpload: (imageData: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        setPreview(base64Data);
        onImageUpload(base64Data);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }, [onImageUpload]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.add('border-indigo-500', 'bg-indigo-50');
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('border-indigo-500', 'bg-indigo-50');
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('border-indigo-500', 'bg-indigo-50');
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      if (fileInputRef.current) {
        fileInputRef.current.files = files;
      }
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        setPreview(base64Data);
        onImageUpload(base64Data);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);


  return (
    <div className="flex flex-col items-center">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
        aria-label="Upload image"
      />
      <div
        className="w-full max-w-md h-64 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 ease-in-out hover:border-indigo-500 hover:bg-indigo-50"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {preview ? (
          <img src={preview} alt="Image Preview" className="max-h-full max-w-full object-contain rounded-lg" />
        ) : (
          <div className="text-center text-gray-500 p-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6H16a2 2 0 012 2v1H6a2 2 0 00-2 2v7"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 16l-4-4m0 0l-4 4m4-4v9"></path>
            </svg>
            <p className="mt-2 text-sm">Drag & drop your image here, or click to select a file</p>
            <p className="text-xs text-gray-400 mt-1">(PNG, JPG, GIF up to 10MB)</p>
          </div>
        )}
      </div>
      {!preview && (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="mt-6 px-8 py-3 bg-indigo-600 text-white font-semibold rounded-full shadow-md hover:bg-indigo-700 transition duration-300 ease-in-out transform hover:scale-105"
        >
          Upload Photo
        </button>
      )}
      {preview && (
        <p className="mt-4 text-sm text-gray-600">Image uploaded successfully! Proceed to editing.</p>
      )}
    </div>
  );
};

export default ImageUploader;