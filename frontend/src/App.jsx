// App.jsx
import React from 'react';
import { useTheme } from './context/ThemeContext';

function App() {
  const { darkMode, setDarkMode } = useTheme();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center transition-all duration-500 ${
        darkMode ? 'bg-black text-white' : 'bg-white text-black'
      }`}
    >
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Toggle Theme</h1>
        <button
          onClick={toggleDarkMode}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-black dark:text-white border rounded shadow"
        >
          {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </button>
      </div>
    </div>
  );
}

export default App;
