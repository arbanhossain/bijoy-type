
import React, { useRef } from 'react';

interface ControlsProps {
  onVocabUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  hasVocabulary: boolean;
}

const Controls: React.FC<ControlsProps> = ({ onVocabUpload, hasVocabulary }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className="flex flex-wrap gap-4 items-center justify-center mt-6">
      <input
        type="file"
        id="vocab-file-input"
        ref={fileInputRef}
        onChange={onVocabUpload}
        accept=".txt"
        className="hidden"
      />
      <button
        onClick={handleUploadClick}
        className="px-6 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 transition-colors duration-200"
      >
        {hasVocabulary ? "নতুন শব্দভান্ডার আপলোড করুন" : "শব্দভান্ডার আপলোড করুন"}
      </button>
    </div>
  );
};

export default Controls;
