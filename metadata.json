
import React, { useState, useMemo, useEffect } from 'react';
import { Submission, User, Role } from '../types';
import { STUDENT_LIST } from '../studentData';

interface SubmissionDashboardProps {
  currentUser: User;
  submissions: Submission[];
  onSubmissionsUpdate: (newSubmissions: Submission[]) => void;
}

const SubmissionDashboard: React.FC<SubmissionDashboardProps> = ({ currentUser, submissions, onSubmissionsUpdate }) => {
  const [videoLink, setVideoLink] = useState('');
  const isCr = currentUser.role === Role.CR;

  const submissionsByRollNo = useMemo(() => {
    return submissions.reduce((acc, submission) => {
      acc[submission.studentRollNo] = submission;
      return acc;
    }, {} as Record<string, Submission>);
  }, [submissions]);

  const currentUserSubmission = useMemo(() => {
    return submissions.find(s => s.studentRollNo === currentUser.rollNo);
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
    if (!videoLink.trim()) return;

    const newSubmission: Submission = {
      studentRollNo: currentUser.rollNo,
      studentName: currentUser.name,
      videoLink: videoLink.trim(),
      submittedAt: new Date().toISOString(),
    };

    // Remove old submission if it exists, then add the new one
    const otherSubmissions = submissions.filter(s => s.studentRollNo !== currentUser.rollNo);
    onSubmissionsUpdate([...otherSubmissions, newSubmission]);
  };
  
  const handleRemove = (rollNoToRemove: string) => {
      if (window.confirm('Are you sure you want to remove this submission?')) {
          const updatedSubmissions = submissions.filter(s => s.studentRollNo !== rollNoToRemove);
          onSubmissionsUpdate(updatedSubmissions);
      }
  };

  const submittedCount = Object.keys(submissionsByRollNo).length;
  const totalStudents = STUDENT_LIST.length;
  const submissionPercentage = totalStudents > 0 ? (submittedCount / totalStudents) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Submission Form for Students */}
      {!isCr && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-indigo-400 mb-4">Submit Your Video Link</h2>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <input
              type="url"
              placeholder="https://example.com/your-video"
              value={videoLink}
              onChange={(e) => setVideoLink(e.target.value)}
              className="flex-grow px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <button type="submit" className="px-6 py-2 font-bold text-white rounded-md bg-indigo-600 hover:bg-indigo-700 transition-colors">
              {currentUserSubmission ? 'Update Link' : 'Submit Link'}
            </button>
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
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                {STUDENT_LIST.map((student) => {
                const submission = submissionsByRollNo[student.rollNo];
                return (
                    <div key={student.rollNo} className="grid grid-cols-12 gap-2 items-center bg-gray-700 p-3 rounded-md text-sm">
                        <span className="col-span-1 font-mono text-gray-400">{student.rollNo}</span>
                        <span className="col-span-12 sm:col-span-4 font-semibold text-gray-200 truncate">{student.name}</span>
                        <div className="col-span-12 sm:col-span-6 truncate">
                            {submission ? (
                                <a href={submission.videoLink} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline break-all">
                                    {submission.videoLink}
                                </a>
                            ) : (
                                <span className="text-yellow-400 font-semibold">Not Submitted</span>
                            )}
                        </div>
                        {isCr && submission && (
                             <div className="col-span-12 sm:col-span-1 flex justify-end">
                                <button onClick={() => handleRemove(student.rollNo)} className="p-1.5 text-gray-400 hover:text-white hover:bg-red-600 rounded-full transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
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
