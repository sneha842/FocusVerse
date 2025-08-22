import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle = () => {
  const { darkMode, setDarkMode } = useContext(ThemeContext);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="w-14 h-8 flex items-center justify-between px-1 rounded-full bg-gray-300 dark:bg-gray-700 transition-all duration-300 shadow-inner"
    >
      <Sun className={`w-5 h-5 text-yellow-500 ${darkMode ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`} />
      <Moon className={`w-5 h-5 text-blue-300 ${darkMode ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`} />
      <span
        className={`absolute w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
          darkMode ? 'translate-x-6' : 'translate-x-0'
        }`}
      ></span>
    </button>
  );
};

export default ThemeToggle;
