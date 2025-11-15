
import { useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { User, Submission } from './types';
import LoginPage from './components/LoginPage';
import SubmissionDashboard from './components/WordDashboard';
import Header from './components/Header';

function App() {
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('word-app-user', null);
  const [submissions, setSubmissions] = useLocalStorage<Submission[]>('video-app-submissions', []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const updateSubmissions = useCallback((newSubmissions: Submission[]) => {
    setSubmissions(newSubmissions);
  }, [setSubmissions]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      {!currentUser ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <>
          <Header user={currentUser} onLogout={handleLogout} />
          <main className="container mx-auto p-4 sm:p-6 lg:p-8">
            <SubmissionDashboard 
              currentUser={currentUser} 
              submissions={submissions} 
              onSubmissionsUpdate={updateSubmissions} 
            />
          </main>
        </>
      )}
    </div>
  );
}

export default App;
