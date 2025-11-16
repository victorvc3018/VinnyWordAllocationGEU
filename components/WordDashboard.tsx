import React, { useState, useMemo, useEffect } from 'react';
import { Submission, User, Role, StudentRecord } from '../types';

interface SubmissionDashboardProps {
  currentUser: User;
  submissions: Submission[];
  setSubmissions: (submissions: Submission[]) => void;
  isLocked: boolean;
  setIsLocked: (isLocked: boolean) => void;
  studentList: StudentRecord[];
  setStudentList: (studentList: StudentRecord[]) => void;
}

const SubmissionDashboard: React.FC<SubmissionDashboardProps> = ({ 
    currentUser, 
    submissions, 
    setSubmissions,
    isLocked,
    setIsLocked,
    studentList,
    setStudentList
}) => {
  const [videoLink, setVideoLink] = useState('');
  const [editingRollNo, setEditingRollNo] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({ name: '', link: '' });

  const isCr = currentUser.role === Role.CR;

  const submissionsByRollNo = useMemo(() => {
    return (submissions || []).reduce((acc, submission) => {
      acc[submission.studentRollNo] = submission;
      return acc;
    }, {} as Record<string, Submission>);
  }, [submissions]);

  const currentUserSubmission = useMemo(() => {
    return (submissions || []).find(s => s.studentRollNo === currentUser.rollNo);
  }, [submissions, currentUser.rollNo]);

  useEffect(() => {
    if (currentUserSubmission) {
      setVideoLink(currentUserSubmission.videoLink);
    } else {
      setVideoLink('');
    }
  }, [currentUserSubmission]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoLink.trim() || isLocked) return;

    const newSubmission: Submission = {
      studentRollNo: currentUser.rollNo,
      studentName: currentUser.name,
      videoLink: videoLink.trim(),
      submittedAt: new Date().toISOString(),
    };

    const existingIndex = submissions.findIndex(s => s.studentRollNo === currentUser.rollNo);
    let newSubmissions;
    if (existingIndex > -1) {
        newSubmissions = [...submissions];
        newSubmissions[existingIndex] = newSubmission;
    } else {
        newSubmissions = [...submissions, newSubmission];
    }
    setSubmissions(newSubmissions);
  };

  const handleStudentRemoveOwnSubmission = () => {
      if (isLocked) return;
      if (window.confirm('Are you sure you want to remove your submitted link?')) {
          setSubmissions(submissions.filter(s => s.studentRollNo !== currentUser.rollNo));
          setVideoLink('');
      }
  }
  
  const handleCrRemoveSubmission = (rollNoToRemove: string) => {
      if (window.confirm('Are you sure you want to remove this submission?')) {
          setSubmissions(submissions.filter(s => s.studentRollNo !== rollNoToRemove));
      }
  };

  const handleEditClick = (student: StudentRecord) => {
    setEditingRollNo(student.rollNo);
    const submission = submissionsByRollNo[student.rollNo];
    setEditFormData({ name: student.name, link: submission ? submission.videoLink : '' });
  };

  const handleCancelEdit = () => {
    setEditingRollNo(null);
    setEditFormData({ name: '', link: '' });
  };

  const handleSaveEdit = (rollNo: string) => {
    const newName = editFormData.name.trim();
    const newLink = editFormData.link.trim();

    // 1. Update student name in the main list
    const updatedStudentList = studentList.map(student => 
        student.rollNo === rollNo ? { ...student, name: newName } : student
    );
    setStudentList(updatedStudentList);
    
    // 2. Update submission (add, update, or remove)
    const currentSubmissions = submissions || [];
    const submissionIndex = currentSubmissions.findIndex(s => s.studentRollNo === rollNo);
    const hasLink = newLink !== '';
    let updatedSubmissions = [...currentSubmissions];

    if (hasLink) {
        const newOrUpdatedSubmission = {
            studentRollNo: rollNo,
            studentName: newName,
            videoLink: newLink,
            submittedAt: submissionIndex > -1 
                ? currentSubmissions[submissionIndex].submittedAt 
                : new Date().toISOString()
        };
        if (submissionIndex > -1) {
            updatedSubmissions[submissionIndex] = newOrUpdatedSubmission;
        } else {
            updatedSubmissions.push(newOrUpdatedSubmission);
        }
    } else {
        if (submissionIndex > -1) {
            updatedSubmissions = currentSubmissions.filter(s => s.studentRollNo !== rollNo);
        }
    }
    setSubmissions(updatedSubmissions);

    handleCancelEdit();
  };

  const handleToggleLock = () => {
      setIsLocked(!isLocked);
  }

  const handleExportToCSV = () => {
    const headers = ['Roll No', 'Name', 'Status', 'Link', 'Submitted At'];
    
    const sortedStudentList = [...studentList].sort((a, b) => parseInt(a.rollNo) - parseInt(b.rollNo));

    const rows = sortedStudentList.map(student => {
        const submission = submissionsByRollNo[student.rollNo];
        return [
            student.rollNo,
            student.name,
            submission ? 'Submitted' : 'Not Submitted',
            submission ? submission.videoLink : '',
            submission ? new Date(submission.submittedAt).toLocaleString() : ''
        ];
    });

    const escapeCell = (cell: string | number) => {
        const strCell = String(cell);
        if (strCell.includes(',') || strCell.includes('"') || strCell.includes('\n')) {
            return `"${strCell.replace(/"/g, '""')}"`;
        }
        return strCell;
    };

    let csvContent = headers.map(escapeCell).join(',') + '\r\n';
    rows.forEach(rowArray => {
        csvContent += rowArray.map(escapeCell).join(',') + '\r\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "video_submissions.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  const submittedCount = (submissions || []).length;
  const totalStudents = (studentList || []).length;
  const submissionPercentage = totalStudents > 0 ? (submittedCount / totalStudents) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* CR Controls */}
      {isCr && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-wrap justify-between items-center gap-4">
            <h2 className="text-xl font-bold text-amber-400">Admin Controls</h2>
            <div className="flex items-center gap-4 flex-wrap">
                <span className={`font-semibold ${isLocked ? 'text-red-500' : 'text-green-500'}`}>
                    Submissions are {isLocked ? 'LOCKED' : 'OPEN'}
                </span>
                <button 
                    onClick={handleToggleLock}
                    className={`px-4 py-2 font-bold text-white rounded-md transition-colors ${isLocked ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                >
                    {isLocked ? 'Unlock' : 'Lock'} All
                </button>
                 <button 
                    onClick={handleExportToCSV}
                    className="px-4 py-2 font-bold text-white rounded-md bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                    Export to CSV
                </button>
            </div>
        </div>
      )}

      {/* Submission Form for Students */}
      {!isCr && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-indigo-400 mb-4">Submit Your Video Link</h2>
          {isLocked && <p className="text-center text-yellow-400 mb-4 font-semibold">Submissions are currently locked by the CR. You cannot make changes.</p>}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-center">
            <input
              type="url"
              placeholder="https://example.com/your-video"
              value={videoLink}
              onChange={(e) => setVideoLink(e.target.value)}
              className="flex-grow w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              required
              disabled={isLocked}
            />
            <div className="flex gap-2 w-full sm:w-auto">
                <button type="submit" className="flex-grow px-6 py-2 font-bold text-white rounded-md bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLocked}>
                    {currentUserSubmission ? 'Update' : 'Submit'}
                </button>
                {currentUserSubmission && (
                    <button type="button" onClick={handleStudentRemoveOwnSubmission} className="px-4 py-2 font-bold text-white rounded-md bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLocked}>
                        Remove
                    </button>
                )}
            </div>
          </form>
          {currentUserSubmission && (
               <p className="text-xs text-gray-400 mt-2">
                   Last updated: {new Date(currentUserSubmission.submittedAt).toLocaleString()}
               </p>
          )}
        </div>
      )}

      {/* Submission Stats */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-teal-400">Submission Status</h2>
            <p className="font-semibold text-gray-300">{submittedCount} / {totalStudents} Submitted</p>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div className="bg-teal-500 h-2.5 rounded-full" style={{ width: `${submissionPercentage}%` }}></div>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Student Submissions</h3>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {(studentList || []).sort((a, b) => parseInt(a.rollNo) - parseInt(b.rollNo)).map((student) => {
                    const submission = submissionsByRollNo[student.rollNo];
                    const isEditing = editingRollNo === student.rollNo;

                    if (isEditing) {
                        return (
                             <div key={student.rollNo} className="bg-gray-600 p-3 rounded-md text-sm space-y-3">
                                <div className="grid grid-cols-12 gap-2 items-center">
                                    <span className="col-span-1 font-mono text-gray-400">{student.rollNo}</span>
                                    <input 
                                        type="text" 
                                        value={editFormData.name} 
                                        onChange={e => setEditFormData({...editFormData, name: e.target.value})}
                                        className="col-span-11 sm:col-span-5 px-2 py-1 bg-gray-800 border border-gray-500 rounded-md"
                                    />
                                    <input 
                                        type="url" 
                                        value={editFormData.link}
                                        placeholder="No link submitted"
                                        onChange={e => setEditFormData({...editFormData, link: e.target.value})}
                                        className="col-span-12 sm:col-span-6 px-2 py-1 bg-gray-800 border border-gray-500 rounded-md"
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button onClick={handleCancelEdit} className="px-3 py-1 bg-gray-500 hover:bg-gray-400 text-white font-semibold rounded-md">Cancel</button>
                                    <button onClick={() => handleSaveEdit(student.rollNo)} className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md">Save</button>
                                </div>
                             </div>
                        )
                    }

                    return (
                        <div key={student.rollNo} className="grid grid-cols-12 gap-2 items-center bg-gray-700 p-3 rounded-md text-sm">
                            <span className="col-span-1 font-mono text-gray-400">{student.rollNo}</span>
                            <span className="col-span-12 sm:col-span-4 font-semibold text-gray-200 truncate">{student.name}</span>
                            <div className="col-span-12 sm:col-span-5 truncate">
                                {submission ? (
                                    <a href={submission.videoLink} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline break-all">
                                        {submission.videoLink}
                                    </a>
                                ) : (
                                    <span className="text-yellow-400 font-semibold">Not Submitted</span>
                                )}
                            </div>
                            {isCr && (
                                <div className="col-span-12 sm:col-span-2 flex justify-end items-center gap-2">
                                    <button onClick={() => handleEditClick(student)} className="p-1.5 text-gray-400 hover:text-white hover:bg-indigo-600 rounded-full transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                                    </button>
                                    {submission && (
                                        <button onClick={() => handleCrRemoveSubmission(student.rollNo)} className="p-1.5 text-gray-400 hover:text-white hover:bg-red-600 rounded-full transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionDashboard;
