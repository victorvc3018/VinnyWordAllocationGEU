import React from 'react';
import { Word, User, Role } from '../types';

interface WordCardProps {
  word: Word;
  currentUser: User;
  isTakenByCurrentUser: boolean;
  onWordClick: (word: Word) => void;
  onEditClick: (word: Word) => void;
}

const EditIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" />
    </svg>
);


const WordCard: React.FC<WordCardProps> = ({ word, currentUser, isTakenByCurrentUser, onWordClick, onEditClick }) => {
  const isTaken = !!word.takenBy;
  const isCr = currentUser.role === Role.CR;
  
  // A CR cannot click the main card to manage a word taken by someone else. They must use the edit icon.
  const isClickDisabledForCr = isCr && isTaken && !isTakenByCurrentUser;

  const baseClasses = "relative p-3 sm:p-4 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 group";
  
  let statusClasses = "";
  if (isTaken) {
    statusClasses = isTakenByCurrentUser ? "bg-indigo-900 border-2 border-indigo-500" : "bg-gray-800 border border-gray-700 opacity-60";
  } else {
    statusClasses = "bg-gray-700 border border-gray-600 hover:bg-gray-600 cursor-pointer";
  }

  // Override cursor for disabled state
  if (isClickDisabledForCr) {
    statusClasses += " cursor-default hover:bg-gray-800";
  }

  const handleCardClick = () => {
    if (isClickDisabledForCr) return;
    onWordClick(word);
  };

  return (
    <div className={`${baseClasses} ${statusClasses}`} onClick={handleCardClick}>
      <p className="font-bold text-base sm:text-lg text-white break-words">{word.text}</p>
      {isTaken && word.takenBy && (
        <div className="mt-2 text-xs space-y-1">
          <p className="text-gray-400">Taken by:</p>
          <div>
            <p className="font-semibold text-teal-400 break-words">{word.takenBy.name}</p>
            <p className="text-gray-300">Roll No: {word.takenBy.rollNo}</p>
            {isCr && <p className="text-gray-300">ID: {word.takenBy.id}</p>}
          </div>
        </div>
      )}
      
      {isCr && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEditClick(word);
          }}
          className="absolute top-2 right-2 p-1.5 bg-gray-600 rounded-full text-gray-300 hover:bg-yellow-600 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
          aria-label={`Manage word ${word.text}`}
        >
          <EditIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default WordCard;
