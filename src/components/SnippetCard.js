import React, { useState } from 'react';
import { FaRegThumbsUp, FaBrain, FaTools, FaMedal, FaBookmark, FaTrash } from 'react-icons/fa';

const SnippetCard = ({ snippet, onClick, userId, onDeleteSnippet }) => {
  const [useful, setUseful] = useState(snippet.useful || 0);
  const [smart, setSmart] = useState(snippet.smart || 0);
  const [refactored, setRefactored] = useState(snippet.refactored || 0);
  const [bookmarked, setBookmarked] = useState(!!snippet.bookmarked);
  const [userReaction, setUserReaction] = useState(null);

  const handleReaction = async (type, setFn) => {
    try {
      const token = localStorage.getItem('jwt');
      await fetch(`http://localhost:8080/api/snippets/${snippet.id || snippet._id}/reaction?type=${type}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token || ''}` }
      });
      setFn(val => val + 1);
      setUserReaction(type);
    } catch (err) {
      console.error('Reaction error:', err);
      alert('Failed to react');
    }
  };

  const handleBookmark = async (e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('jwt');
      const res = await fetch(`http://localhost:8080/api/snippets/${snippet.id || snippet._id}/bookmark`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token || ''}` }
      });
      const data = await res.json();
      setBookmarked(data.bookmarked);
      if (snippet.onBookmarkToggle) snippet.onBookmarkToggle(data.bookmarked);
    } catch (err) {
      console.error('Bookmark error:', err);
      alert('Failed to bookmark');
    }
  };

  return (
    <div
      className="bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 mb-4 w-full max-w-full cursor-pointer hover:shadow-2xl transition border border-gray-700 flex flex-col"
      onClick={onClick}
      style={{ minWidth: 0 }}
    >
      {/* Delete button for author */}
      {userId && (userId === snippet.author_id) && onDeleteSnippet && (
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1 rounded focus:outline-none z-10"
          title="Delete Snippet"
          onClick={e => { e.stopPropagation(); onDeleteSnippet(snippet.id || snippet._id); }}
        >
          <FaTrash className="text-lg" />
        </button>
      )}
      <div className="flex items-center mb-3">
        <img src={snippet.author_avatar || 'https://placehold.co/32x32?text=Avatar'} alt="User Avatar" className="rounded-full mr-3 w-8 h-8 border-2 border-gray-600 object-cover" />
        <div>
          <p className="font-semibold text-base leading-tight">{snippet.author_username || 'Username'}</p>
          <p className="text-gray-400 text-xs">{snippet.language || ''}</p>
        </div>
      </div>
      <h3 className="font-bold text-lg mb-1 hover:text-blue-400 truncate">{snippet.title}</h3>
      <p className="text-gray-300 mb-3 line-clamp-3 text-sm">{snippet.description}</p>
      <div className="flex flex-wrap gap-1 items-center justify-between mb-3">
        <div className="flex flex-wrap gap-1">
          <button className={`bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-600 text-xs flex items-center gap-1${userReaction === 'useful' ? ' ring-2 ring-yellow-400' : ''}`} onClick={e => { e.stopPropagation(); handleReaction('useful', setUseful); }}>
            <FaRegThumbsUp className="text-yellow-400" /> <span className="text-gray-400 ml-1">{useful}</span>
          </button>
          <button className={`bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-600 text-xs flex items-center gap-1${userReaction === 'smart' ? ' ring-2 ring-pink-400' : ''}`} onClick={e => { e.stopPropagation(); handleReaction('smart', setSmart); }}>
            <FaBrain className="text-pink-400" /> <span className="text-gray-400 ml-1">{smart}</span>
          </button>
          <button className={`bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-600 text-xs flex items-center gap-1${userReaction === 'refactored' ? ' ring-2 ring-blue-400' : ''}`} onClick={e => { e.stopPropagation(); handleReaction('refactored', setRefactored); }}>
            <FaTools className="text-blue-400" /> <span className="text-gray-400 ml-1">{refactored}</span>
          </button>
        </div>
        <FaBookmark
          className={`text-xl cursor-pointer transition ml-2 ${bookmarked ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'}`}
          onClick={handleBookmark}
          title={bookmarked ? 'Bookmarked' : 'Bookmark'}
        />
      </div>
      <div className="flex mt-2">
        <span className="bg-yellow-400 text-gray-900 px-2 py-0.5 rounded font-semibold text-xs shadow-sm border border-yellow-300 flex items-center gap-1">
          <FaMedal className="text-yellow-500" /> Snippet Master
        </span>
      </div>
    </div>
  );
};

export default SnippetCard; 