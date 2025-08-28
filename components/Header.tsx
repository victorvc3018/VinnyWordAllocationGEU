import React from 'react';
import { User, Role } from '../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <h1 className="text-lg sm:text-xl font-bold text-indigo-400">Word Allocation Board</h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="text-right">
              <p className="font-semibold text-white text-sm sm:text-base">{user.name}</p>
              <p className="text-xs text-gray-400 hidden sm:block">{user.id} ({user.role === Role.CR ? 'CR' : 'Student'})</p>
            </div>
            <button
              onClick={onLogout}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors text-sm sm:text-base"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
