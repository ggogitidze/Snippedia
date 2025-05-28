import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ search, setSearch, onCreateSnippet, onLogout, showSearch = true, showCreate = true, hideRight = false, rightContent = null }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav className="w-full bg-gray-800 px-4 py-3 flex items-center justify-between shadow-md z-50 relative">
      <button
        className="flex items-center focus:outline-none group"
        style={{ background: 'none', border: 'none', padding: 0, margin: 0 }}
        onClick={() => navigate('/feed')}
        tabIndex={0}
        aria-label="Go to home"
      >
        <span className="flex items-center text-white select-none">
          <span className="text-2xl md:text-3xl font-extrabold mr-2" style={{fontFamily: 'monospace'}}>&lt;/&gt;</span>
          <span className="text-2xl md:text-3xl font-extrabold tracking-tight">Snippedia</span>
        </span>
      </button>
      {/* Hamburger for mobile */}
      <button className="md:hidden text-white text-3xl ml-2" onClick={() => setMenuOpen(v => !v)}>
        <i className="fas fa-bars"></i>
      </button>
      {/* Desktop menu */}
      {rightContent ? (
        <div className="hidden md:flex items-center gap-4">{rightContent}</div>
      ) : !hideRight && (
        <div className="hidden md:flex flex-1 items-center justify-end gap-4">
          {showSearch && (
            <input
              type="text"
              placeholder="Search snippets..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-gray-700 text-white px-4 py-2 rounded focus:outline-none w-64 max-w-xs ml-auto"
            />
          )}
          {showCreate && (
            <button
              onClick={onCreateSnippet}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 font-semibold"
            >
              + Create Snippet
            </button>
          )}
          <button
            onClick={() => navigate('/profile')}
            className="focus:outline-none ml-2"
            title="Profile"
          >
            <i className="fas fa-user-circle text-2xl text-gray-300 hover:text-white"></i>
          </button>
          <button
            onClick={onLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500 ml-2 font-semibold"
          >
            Logout
          </button>
        </div>
      )}
      {/* Mobile menu drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex justify-end md:hidden">
          <div className="bg-gray-800 w-64 h-full p-6 flex flex-col gap-4 shadow-lg animate-slide-left relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl" onClick={() => setMenuOpen(false)}>&times;</button>
            {showSearch && (
              <input
                type="text"
                placeholder="Search snippets..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-gray-700 text-white px-4 py-2 rounded focus:outline-none w-full"
              />
            )}
            {showCreate && (
              <button
                onClick={() => { setMenuOpen(false); onCreateSnippet(); }}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 font-semibold w-full"
              >
                + Create Snippet
              </button>
            )}
            <button
              onClick={() => { setMenuOpen(false); navigate('/profile'); }}
              className="focus:outline-none w-full text-left text-lg text-gray-300 hover:text-white"
              title="Profile"
            >
              <i className="fas fa-user-circle mr-2"></i> Profile
            </button>
            <button
              onClick={() => { setMenuOpen(false); onLogout(); }}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500 font-semibold w-full"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 