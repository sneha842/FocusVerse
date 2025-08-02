// Navbar.jsx
import React from 'react';
import ThemeToggle from './themeToggle';

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center px-6 py-4 shadow-md bg-white dark:bg-gray-900 text-black dark:text-white">
      <h1 className="text-2xl font-bold">FocusVerse</h1>
      <ThemeToggle />
    </nav>
  );
};

export default Navbar;
