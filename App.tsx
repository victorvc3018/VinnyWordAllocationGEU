
import { useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { User, Word, Category } from './types';
import { generateInitialWords } from './services/wordService';
import { INITIAL_CATEGORIES } from './constants';
import LoginPage from './components/LoginPage';
import WordDashboard from './components/WordDashboard';
import Header from './components/Header';

function App() {
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('word-app-user', null);
  const [words, setWords] = useLocalStorage<Word[]>('word-app-words', generateInitialWords);
  const [categories, setCategories] = useLocalStorage<Category[]>('word-app-categories', INITIAL_CATEGORIES);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const updateWords = useCallback((newWords: Word[]) => {
    setWords(newWords);
  }, [setWords]);

  const handleCategoryNameChange = useCallback((oldCategory: Category, newCategory: Category) => {
    const trimmedNewCategory = newCategory.trim();
    if (!trimmedNewCategory || oldCategory === trimmedNewCategory) return;

    // 1. Update the list of categories
    setCategories(prevCategories =>
      prevCategories.map(c => (c === oldCategory ? trimmedNewCategory : c))
    );

    // 2. Update all words belonging to the old category
    setWords(prevWords =>
      prevWords.map(word =>
        word.category === oldCategory ? { ...word, category: trimmedNewCategory } : word
      )
    );
  }, [setCategories, setWords]);


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
              categories={categories}
              onCategoryNameChange={handleCategoryNameChange}
            />
          </main>
        </>
      )}
    </div>
  );
}

export default App;
