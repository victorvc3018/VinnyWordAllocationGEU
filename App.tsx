
import { useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { User, Word } from './types';
import { generateInitialWords } from './services/wordService';
import LoginPage from './components/LoginPage';
import WordDashboard from './components/WordDashboard';
import Header from './components/Header';

function App() {
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('word-app-user', null);
  const [words, setWords] = useLocalStorage<Word[]>('word-app-words', generateInitialWords);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const updateWords = useCallback((newWords: Word[]) => {
    setWords(newWords);
  }, [setWords]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      {!currentUser ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <>
          <Header user={currentUser} onLogout={handleLogout} />
          <main className="container mx-auto p-4 sm:p-6 lg:p-8">
            <WordDashboard 
              currentUser={currentUser} 
              words={words} 
              onWordsUpdate={updateWords} 
            />
          </main>
        </>
      )}
    </div>
  );
}

export default App;
