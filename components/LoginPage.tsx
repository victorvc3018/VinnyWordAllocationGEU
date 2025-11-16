import React, { useState, useEffect } from 'react';
import { User, Role, StudentRecord } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
  studentList: StudentRecord[];
}

const getTodaysPassword = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
  const year = today.getFullYear();
  return `${day}${month}${year}`;
};

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, studentList }) => {
  const [activeTab, setActiveTab] = useState<Role>(Role.Student);
  
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [isStudentDataLocked, setIsStudentDataLocked] = useState(false);
  
  const [crName, setCrName] = useState('');
  const [crStudentId, setCrStudentId] = useState('');
  const [crRollNo, setCrRollNo] = useState('');
  const [crPassword, setCrPassword] = useState('');
  
  const [error, setError] = useState('');

  useEffect(() => {
    const savedStudent = localStorage.getItem('word-app-student-info');
    if (savedStudent) {
      const { id, name, rollNo } = JSON.parse(savedStudent);
      setStudentId(id);
      setStudentName(name);
      setRollNo(rollNo);
      setIsStudentDataLocked(true);
    }
  }, []);

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmedName = studentName.trim();
    const trimmedRollNo = rollNo.trim();
    const trimmedId = studentId.trim();

    if (!trimmedId || !trimmedName || !trimmedRollNo) {
      setError('Student ID, Full Name, and Roll Number are required.');
      return;
    }
    
    if (studentList.length === 0) {
        setError('Student data is still loading, please wait a moment.');
        return;
    }

    // Validation logic: Skip name check only for roll number 67
    if (trimmedRollNo !== '67') {
        const studentExists = studentList.some(
            student => student.rollNo.toString() === trimmedRollNo && student.name.toLowerCase() === trimmedName.toLowerCase()
        );
        if (!studentExists) {
            setError('Invalid Name or Roll Number. Please check the class list.');
            return;
        }
    }

    const user: User = { id: trimmedId, name: trimmedName, rollNo: trimmedRollNo, role: Role.Student };
    if (!isStudentDataLocked) {
      localStorage.setItem('word-app-student-info', JSON.stringify({ id: user.id, name: user.name, rollNo: user.rollNo }));
    }
    onLogin(user);
  };

  const handleCrLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmedCrName = crName.trim();
    const trimmedCrStudentId = crStudentId.trim();
    const trimmedCrRollNo = crRollNo.trim();
    const trimmedCrPassword = crPassword.trim();

    if (!trimmedCrName || !trimmedCrStudentId || !trimmedCrPassword || !trimmedCrRollNo) {
      setError('All CR fields are required.');
      return;
    }
    if (trimmedCrPassword !== getTodaysPassword()) {
      setError('Incorrect password.');
      return;
    }
    
    if (studentList.length === 0) {
        setError('Student data is still loading, please wait a moment.');
        return;
    }
    
    const studentRecord = studentList.find(student => student.rollNo.toString() === trimmedCrRollNo);

    if (!studentRecord) {
        setError('Invalid Roll Number. Please check the class list.');
        return;
    }

    // If roll number is not 67, also validate the name.
    if (trimmedCrRollNo !== '67' && studentRecord.name.toLowerCase() !== trimmedCrName.toLowerCase()) {
        setError('Invalid CR Name for the given Roll Number. Please check the class list.');
        return;
    }

    const user: User = { id: trimmedCrStudentId, name: trimmedCrName, rollNo: trimmedCrRollNo, role: Role.CR };
    onLogin(user);
  };
  
  const commonInputClasses = "w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const commonButtonClasses = "w-full px-4 py-2 font-bold text-white rounded-md transition-colors";
  const tabButtonClasses = (isActive: boolean) => 
    `w-1/2 py-3 text-center font-semibold rounded-t-lg transition-colors text-sm sm:text-base ${
      isActive ? 'bg-gray-800 text-indigo-400' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
    }`;


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-md mx-auto bg-gray-800 shadow-2xl rounded-lg overflow-hidden">
        <h1 className="text-2xl sm:text-3xl font-bold text-center py-6 bg-gray-900 text-indigo-400">Video Submission Portal</h1>
        <div className="flex">
          <button onClick={() => setActiveTab(Role.Student)} className={tabButtonClasses(activeTab === Role.Student)}>
            Student
          </button>
          <button onClick={() => setActiveTab(Role.CR)} className={tabButtonClasses(activeTab === Role.CR)}>
            CR
          </button>
        </div>
        
        <div className="p-6 sm:p-8">
          {activeTab === Role.Student ? (
            <form onSubmit={handleStudentLogin} className="space-y-6">
              <div>
                <label htmlFor="studentId" className="block mb-2 text-sm font-medium text-gray-300">Student ID</label>
                <input
                  type="text"
                  id="studentId"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  disabled={isStudentDataLocked}
                  className={`${commonInputClasses} ${isStudentDataLocked ? 'cursor-not-allowed bg-gray-600' : ''}`}
                />
              </div>
              <div>
                <label htmlFor="studentName" className="block mb-2 text-sm font-medium text-gray-300">Full Name</label>
                <input
                  type="text"
                  id="studentName"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  disabled={isStudentDataLocked}
                  className={`${commonInputClasses} ${isStudentDataLocked ? 'cursor-not-allowed bg-gray-600' : ''}`}
                />
              </div>
              <div>
                <label htmlFor="rollNo" className="block mb-2 text-sm font-medium text-gray-300">Roll Number</label>
                <input
                  type="text"
                  id="rollNo"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  disabled={isStudentDataLocked}
                  className={`${commonInputClasses} ${isStudentDataLocked ? 'cursor-not-allowed bg-gray-600' : ''}`}
                />
              </div>
              {isStudentDataLocked && <p className="text-xs text-center text-yellow-400">Your details are locked after first login.</p>}
              <button type="submit" className={`${commonButtonClasses} bg-indigo-600 hover:bg-indigo-700`}>
                Login as Student
              </button>
            </form>
          ) : (
            <form onSubmit={handleCrLogin} className="space-y-6">
              <div>
                <label htmlFor="crName" className="block mb-2 text-sm font-medium text-gray-300">CR Name</label>
                <input
                  type="text"
                  id="crName"
                  value={crName}
                  onChange={(e) => setCrName(e.target.value)}
                  className={commonInputClasses}
                />
              </div>
               <div>
                <label htmlFor="crStudentId" className="block mb-2 text-sm font-medium text-gray-300">Student ID</label>
                <input
                  type="text"
                  id="crStudentId"
                  value={crStudentId}
                  onChange={(e) => setCrStudentId(e.target.value)}
                  className={commonInputClasses}
                />
              </div>
              <div>
                <label htmlFor="crRollNo" className="block mb-2 text-sm font-medium text-gray-300">Roll Number</label>
                <input
                  type="text"
                  id="crRollNo"
                  value={crRollNo}
                  onChange={(e) => setCrRollNo(e.target.value)}
                  className={commonInputClasses}
                />
              </div>
              <div>
                <label htmlFor="crPassword" className="block mb-2 text-sm font-medium text-gray-300">Password</label>
                <input
                  type="password"
                  id="crPassword"
                  value={crPassword}
                  onChange={(e) => setCrPassword(e.target.value)}
                  className={commonInputClasses}
                />
              </div>
              <button type="submit" className={`${commonButtonClasses} bg-teal-600 hover:bg-teal-700`}>
                Login as CR
              </button>
            </form>
          )}
          {error && <p className="mt-4 text-center text-sm text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
