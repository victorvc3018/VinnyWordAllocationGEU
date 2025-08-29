import React, { useState, useMemo } from 'react';
import { Word, User, Role, Category } from '../types';
import { CATEGORIES } from '../constants';
import { STUDENT_LIST, StudentRecord } from '../studentData';
import WordCard from './WordCard';

interface WordDashboardProps {
  currentUser: User;
  words: Word[];
  onWordsUpdate: (newWords: Word[]) => void;
}

// --- SVG Icons defined within component ---
const PlusIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const UsersIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-3-5.197m-3 0a4 4 0 115.196 0M15 21a6 6 0 01-9-5.197" />
    </svg>
);


const BaseModal: React.FC<{ title: string; children: React.ReactNode; onClose: () => void, size?: 'md' | 'lg' }> = ({ title, children, onClose, size = 'md' }) => {
    const maxWidthClass = size === 'lg' ? 'max-w-lg' : 'max-w-md';
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className={`bg-gray-800 rounded-lg shadow-xl w-full ${maxWidthClass} max-h-full flex flex-col`}>
                <div className="flex justify-between items-center p-4 border-b border-gray-700 sticky top-0 bg-gray-800">
                    <h3 className="text-lg sm:text-xl font-bold text-indigo-400">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>
                <div className="p-4 sm:p-6 overflow-y-auto">{children}</div>
            </div>
        </div>
    );
};


// --- Main Dashboard Component ---
const WordDashboard: React.FC<WordDashboardProps> = ({ currentUser, words, onWordsUpdate }) => {
  const [modalState, setModalState] = useState<{ type: 'add' | 'cr-manage' | 'unassigned'; data: any } | null>(null);

  const wordsByCategory = useMemo(() => {
    return words.reduce((acc, word) => {
      if (!acc[word.category]) {
        acc[word.category] = [];
      }
      acc[word.category].push(word);
      return acc;
    }, {} as Record<Category, Word[]>);
  }, [words]);

  const currentUserWord = useMemo(() => words.find(w => w.takenBy?.id === currentUser.id), [words, currentUser.id]);

  const handleWordClick = (word: Word) => {
    let newWords = [...words];

    // Deselect current word if user has one
    if (currentUserWord) {
      const currentWordIndex = newWords.findIndex(w => w.id === currentUserWord.id);
      if (currentWordIndex !== -1) {
        newWords[currentWordIndex] = { ...newWords[currentWordIndex], takenBy: undefined };
      }
    }

    // Select new word, if it's not the one they just deselected
    if (!word.takenBy || word.id !== currentUserWord?.id) {
        const newWordIndex = newWords.findIndex(w => w.id === word.id);
        if (newWordIndex !== -1 && !newWords[newWordIndex].takenBy) {
            newWords[newWordIndex] = { ...newWords[newWordIndex], takenBy: { id: currentUser.id, name: currentUser.name, rollNo: currentUser.rollNo }};
        }
    }
    onWordsUpdate(newWords);
  };
  
  const handleSaveChanges = (updatedWord: Word) => {
    const newWords = words.map(w => w.id === updatedWord.id ? updatedWord : w);
    onWordsUpdate(newWords);
    const currentModalData = modalState?.data;
    if (currentModalData && currentModalData.id === updatedWord.id) {
        setModalState({ ...modalState, data: updatedWord });
    }
  }

  const handleAddWord = (text: string, category: Category) => {
    if (!text.trim()) return;
    const newWord: Word = {
      id: Date.now(),
      text: text.trim(),
      category,
    };
    onWordsUpdate([...words, newWord]);
    setModalState(null);
  };

  const handleReleaseWord = (wordId: number) => {
    const newWords = words.map(w => w.id === wordId ? {...w, takenBy: undefined} : w);
    onWordsUpdate(newWords);
    setModalState(null);
  };

  const handleAssignWord = (wordId: number, studentId: string, studentName: string, studentRollNo: string) => {
      if (!studentId.trim() || !studentName.trim() || !studentRollNo.trim()) return;
      const newWords = words.map(w => {
          if (w.takenBy?.id === studentId.trim()) return {...w, takenBy: undefined};
          return w;
      }).map(w => {
          if (w.id === wordId) return {...w, takenBy: {id: studentId.trim(), name: studentName.trim(), rollNo: studentRollNo.trim()}};
          return w;
      });

      onWordsUpdate(newWords);
      setModalState(null);
  };

  return (
    <div>
      <div className="flex justify-end mb-8">
        {currentUser.role === Role.CR && (
            <button onClick={() => setModalState({ type: 'unassigned', data: null })} className="flex items-center space-x-2 px-3 py-2 sm:px-4 sm:py-2 bg-teal-600 text-white font-semibold rounded-md hover:bg-teal-700 transition-colors w-full sm:w-auto justify-center">
                <UsersIcon className="w-5 h-5" />
                <span>See Unassigned Students</span>
            </button>
        )}
      </div>

      {CATEGORIES.map(category => (
        <div key={category} className="mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-teal-400">{category}</h2>
            {currentUser.role === Role.CR && (
              <button onClick={() => setModalState({ type: 'add', data: category })} className="flex items-center space-x-2 px-3 py-2 sm:px-4 sm:py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors w-full sm:w-auto justify-center">
                <PlusIcon className="w-5 h-5" />
                <span>Add Word</span>
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {wordsByCategory[category]?.map(word => (
              <WordCard 
                key={word.id}
                word={word}
                currentUser={currentUser}
                isTakenByCurrentUser={word.takenBy?.id === currentUser.id}
                onWordClick={handleWordClick}
                onEditClick={(w) => setModalState({ type: 'cr-manage', data: w })}
              />
            ))}
          </div>
        </div>
      ))}

        {modalState?.type === 'add' && (
            <AddWordModal category={modalState.data} onAdd={handleAddWord} onClose={() => setModalState(null)} />
        )}
        {modalState?.type === 'cr-manage' && (
            <CrWordManagementModal 
                word={modalState.data} 
                onClose={() => setModalState(null)} 
                onSave={handleSaveChanges}
                onRelease={handleReleaseWord}
                onAssign={handleAssignWord}
            />
        )}
        {modalState?.type === 'unassigned' && (
            <UnassignedStudentsModal words={words} onClose={() => setModalState(null)} />
        )}
    </div>
  );
};


// --- Modal Components ---

const AddWordModal: React.FC<{ category: Category; onAdd: (text: string, category: Category) => void; onClose: () => void }> = ({ category, onAdd, onClose }) => {
    const [text, setText] = useState('');
    return (
        <BaseModal title={`Add Word to ${category}`} onClose={onClose}>
            <div className="space-y-4">
                <input type="text" value={text} onChange={e => setText(e.target.value)} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                <button onClick={() => onAdd(text, category)} className="w-full px-4 py-2 font-bold text-white rounded-md bg-indigo-600 hover:bg-indigo-700">Add Word</button>
            </div>
        </BaseModal>
    );
};

const CrWordManagementModal: React.FC<{ 
    word: Word; 
    onClose: () => void;
    onSave: (updatedWord: Word) => void;
    onRelease: (wordId: number) => void;
    onAssign: (wordId: number, studentId: string, studentName: string, studentRollNo: string) => void;
}> = ({ word, onClose, onSave, onRelease, onAssign }) => {
    const [text, setText] = useState(word.text);
    const [studentId, setStudentId] = useState('');
    const [studentName, setStudentName] = useState('');
    const [studentRollNo, setStudentRollNo] = useState('');

    const handleSaveText = () => {
        if (text.trim() && text.trim() !== word.text) {
            onSave({ ...word, text: text.trim() });
        }
    };
    
    const handleAssign = () => {
        if (studentId.trim() && studentName.trim() && studentRollNo.trim()) {
            onAssign(word.id, studentId, studentName, studentRollNo);
        }
    };

    return (
        <BaseModal title={`Manage Word`} onClose={onClose}>
            <div className="space-y-6">
                <div>
                    <h4 className="font-semibold mb-2 text-gray-300">Edit Word Text</h4>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                        <input type="text" value={text} onChange={e => setText(e.target.value)} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                        <button onClick={handleSaveText} disabled={!text.trim() || text.trim() === word.text} className="px-4 py-2 font-bold text-white rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed flex-shrink-0">Save</button>
                    </div>
                </div>

                <div className="border-t border-gray-700"></div>

                {word.takenBy ? (
                    <div>
                        <p className="text-gray-400 mb-1">Currently taken by:</p>
                        <div className="font-bold text-teal-400 mb-4 break-words">
                           <p>{word.takenBy.name} (Roll: {word.takenBy.rollNo}, ID: {word.takenBy.id})</p>
                        </div>
                        <button onClick={() => onRelease(word.id)} className="w-full px-4 py-2 font-bold text-white rounded-md bg-yellow-600 hover:bg-yellow-700">Release Word (Make Available)</button>
                    </div>
                ) : (
                    <p className="text-gray-400">This word is currently available.</p>
                )}
                
                <div className="border-t border-gray-700 pt-4">
                    <h4 className="font-semibold mb-2 text-gray-300">{word.takenBy ? 'Re-assign to a different student' : 'Assign to a student'}</h4>
                    <div className="space-y-4">
                        <div>
                             <label htmlFor="studentIdAssign" className="block text-sm font-medium text-gray-300 mb-1">Student ID</label>
                             <input id="studentIdAssign" type="text" value={studentId} onChange={e => setStudentId(e.target.value)} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md"/>
                        </div>
                        <div>
                             <label htmlFor="studentNameAssign" className="block text-sm font-medium text-gray-300 mb-1">Student Name</label>
                             <input id="studentNameAssign" type="text" value={studentName} onChange={e => setStudentName(e.target.value)} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md"/>
                        </div>
                        <div>
                             <label htmlFor="studentRollNoAssign" className="block text-sm font-medium text-gray-300 mb-1">Student Roll No</label>
                             <input id="studentRollNoAssign" type="text" value={studentRollNo} onChange={e => setStudentRollNo(e.target.value)} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md"/>
                        </div>
                         <button onClick={handleAssign} disabled={!studentId.trim() || !studentName.trim() || !studentRollNo.trim()} className="w-full px-4 py-2 font-bold text-white rounded-md bg-teal-600 hover:bg-teal-700 disabled:bg-gray-500 disabled:cursor-not-allowed">Assign</button>
                    </div>
                </div>
            </div>
        </BaseModal>
    );
};

const UnassignedStudentsModal: React.FC<{ words: Word[]; onClose: () => void }> = ({ words, onClose }) => {
    const unassignedStudents = useMemo(() => {
        const assignedRollNumbers = new Set(words.filter(w => w.takenBy).map(w => w.takenBy!.rollNo));
        return STUDENT_LIST.filter(student => !assignedRollNumbers.has(student.rollNo));
    }, [words]);

    return (
        <BaseModal title="Students Without a Word" onClose={onClose} size="lg">
            {unassignedStudents.length > 0 ? (
                <ul className="space-y-2">
                    {unassignedStudents.map(student => (
                        <li key={student.rollNo} className="flex items-center justify-between bg-gray-700 p-3 rounded-md">
                            <span className="font-semibold text-gray-200">{student.name}</span>
                            <span className="text-sm text-gray-400">Roll No: {student.rollNo}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center text-gray-400">All students have selected a word.</p>
            )}
        </BaseModal>
    );
};

export default WordDashboard;
