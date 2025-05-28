import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SnippetCard from '../components/SnippetCard';
import SnippetDetailModal from '../components/SnippetDetailModal';
import Navbar from '../components/Navbar';
import { API_URL } from '../App';
// import SubmitPage from './SubmitPage'; // We'll use a modal instead

const MainFeed = () => {
  const navigate = useNavigate();
  const [search, setSearch] = React.useState('');
  const [selectedTag, setSelectedTag] = React.useState(null);
  const [sortByDate, setSortByDate] = React.useState(null); // 'newest' or 'oldest'
  const [sortByBookmarks, setSortByBookmarks] = React.useState(false);
  const [showSubmitModal, setShowSubmitModal] = React.useState(false);
  const [snippets, setSnippets] = React.useState([]);
  const [bookmarkedIds, setBookmarkedIds] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [selectedSnippet, setSelectedSnippet] = React.useState(null);
  const [userProfile, setUserProfile] = React.useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, snippetId: null });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch user profile for author info
  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('jwt');
        const res = await fetch(`${API_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token || ''}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUserProfile(data);
          setBookmarkedIds(data.bookmarked_ids || []);
        }
      } catch (err) {
        // ignore for now
      }
    };
    fetchProfile();
  }, []);

  // Fetch snippets from backend
  React.useEffect(() => {
    const fetchSnippets = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('jwt');
        const res = await fetch(`${API_URL}/api/snippets`, {
          headers: {
            Authorization: `Bearer ${token || ''}`
          }
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch snippets');
        }
        const data = await res.json();
        if (data && data.length > 0) {
          console.log('First snippet from backend:', data[0]);
        }
        setSnippets(data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSnippets();
  }, []);

  // Get all unique tags
  const tags = [...new Set((Array.isArray(snippets) ? snippets : []).flatMap(s => s.tags || []))];

  // Search filter
  const filteredSnippets = (Array.isArray(snippets) ? snippets : []).filter(
    s =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description?.toLowerCase().includes(search.toLowerCase()) ||
      s.content?.toLowerCase().includes(search.toLowerCase())
  );

  // Tag filter
  const tagFilteredSnippets = selectedTag
    ? filteredSnippets.filter(s => (s.tags || []).includes(selectedTag))
    : filteredSnippets;

  // Date and Bookmarks sort
  let finalSnippets = [...tagFilteredSnippets];
  if (sortByBookmarks) {
    finalSnippets.sort((a, b) => (b.bookmarks || 0) - (a.bookmarks || 0));
    if (sortByDate) {
      finalSnippets.sort((a, b) =>
        sortByDate === 'newest'
          ? new Date(b.createdAt) - new Date(a.createdAt)
          : new Date(a.createdAt) - new Date(b.createdAt)
      );
    }
  } else if (sortByDate) {
    finalSnippets.sort((a, b) =>
      sortByDate === 'newest'
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    );
  }

  // Handle submit modal
  const handleSnippetSubmit = async (newSnippet) => {
    try {
      const token = localStorage.getItem('jwt');
      // Only send author_id, let backend populate author info
      const snippetWithAuthor = {
        ...newSnippet,
        author_id: userProfile?.id,
      };
      const res = await fetch(`${API_URL}/api/snippets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`
        },
        body: JSON.stringify(snippetWithAuthor)
      });
      if (!res.ok) {
        const errorData = await res.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to create snippet');
      }
      const created = await res.json();
      setSnippets(prev => Array.isArray(prev) ? [created, ...prev] : [created]);
      setShowSubmitModal(false);
    } catch (err) {
      console.error('Submit error:', err);
      alert(err.message);
    }
  };

  // Logout functionality
  const handleLogout = () => {
    localStorage.removeItem('jwt');
    navigate('/login');
  };

  // Delete snippet handler
  const handleDeleteSnippet = (snippetId) => {
    setDeleteModal({ open: true, snippetId });
  };

  const confirmDeleteSnippet = async () => {
    const snippetId = deleteModal.snippetId;
    setDeleteModal({ open: false, snippetId: null });
    try {
      const token = localStorage.getItem('jwt');
      const res = await fetch(`${API_URL}/api/snippets/${snippetId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token || ''}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete snippet');
      }
      setSnippets(prev => prev.filter(s => (s.id || s._id) !== snippetId));
    } catch (err) {
      alert('Failed to delete snippet. ' + (err.message || ''));
    }
  };

  const cancelDeleteSnippet = () => setDeleteModal({ open: false, snippetId: null });

  const mapSnippetForCard = (snippet) => ({
    ...snippet,
    author_username: snippet.author_username,
    author_avatar: snippet.author_avatar,
    author_github: snippet.author_github || '',
    author_bio: snippet.author_bio || '',
    code: snippet.code || '',
    description: snippet.description || '',
    language: snippet.language || '',
    id: snippet.id || snippet._id,
    author_id: snippet.author_id,
    bookmarked: bookmarkedIds.includes((snippet.id || snippet._id)),
    onBookmarkToggle: (isBookmarked) => {
      setBookmarkedIds((prev) => {
        const id = snippet.id || snippet._id;
        if (isBookmarked) return [...new Set([...prev, id])];
        return prev.filter((bid) => bid !== id);
      });
    },
  });

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      <Navbar
        search={search}
        setSearch={setSearch}
        onCreateSnippet={() => setShowSubmitModal(true)}
        onLogout={handleLogout}
      />

      {/* Mobile filter button */}
      <div className="md:hidden flex justify-end px-4 pt-2">
        <button
          className="bg-gray-700 text-white px-4 py-2 rounded mb-2 text-sm font-semibold flex items-center gap-2"
          onClick={() => setShowFilters(true)}
        >
          <i className="fas fa-filter"></i> Filters
        </button>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-start justify-center md:hidden">
          <div className="bg-gray-800 rounded-b-2xl w-full max-w-md mx-auto p-6 shadow-lg relative animate-slide-down">
            <button
              className="absolute top-2 right-4 text-gray-400 hover:text-white text-2xl"
              onClick={() => setShowFilters(false)}
            >
              &times;
            </button>
            <nav className="flex flex-col gap-4">
              <div className="mb-6">
                <span className="text-lg font-bold tracking-wide text-gray-200 flex items-center gap-2"><i className="fas fa-filter mr-2"></i> Filters</span>
              </div>
              <div>
                <div className="mb-2 font-semibold text-gray-400 flex items-center gap-2"><i className="fas fa-tags"></i> Tags</div>
                {tags.length === 0 ? <div className="text-gray-500">No tags</div> : tags.map(tag => (
                  <button
                    key={tag}
                    className={`w-full mb-1 bg-gray-700 text-left px-4 py-2 rounded hover:bg-gray-600 transition border ${selectedTag === tag ? 'bg-blue-600 text-white border-blue-400 shadow' : 'text-gray-200 border-transparent'}`}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  >
                    <i className="fas fa-tag mr-2"></i>{tag}
                  </button>
                ))}
              </div>
              <div className="mt-6">
                <div className="mb-2 font-semibold text-gray-400 flex items-center gap-2"><i className="fas fa-calendar-alt"></i> Date</div>
                <button
                  className={`w-full mb-1 bg-gray-700 text-left px-4 py-2 rounded hover:bg-gray-600 transition border ${sortByDate === 'newest' ? 'bg-blue-600 text-white border-blue-400 shadow' : 'text-gray-200 border-transparent'}`}
                  onClick={() => setSortByDate(sortByDate === 'newest' ? null : 'newest')}
                >
                  <i className="fas fa-arrow-down mr-2"></i>Newest
                </button>
                <button
                  className={`w-full mb-1 bg-gray-700 text-left px-4 py-2 rounded hover:bg-gray-600 transition border ${sortByDate === 'oldest' ? 'bg-blue-600 text-white border-blue-400 shadow' : 'text-gray-200 border-transparent'}`}
                  onClick={() => setSortByDate(sortByDate === 'oldest' ? null : 'oldest')}
                >
                  <i className="fas fa-arrow-up mr-2"></i>Oldest
                </button>
              </div>
              <div className="mt-6">
                <div className="mb-2 font-semibold text-gray-400 flex items-center gap-2"><i className="fas fa-bookmark"></i> Bookmarks</div>
                <button
                  className={`w-full bg-gray-700 text-left px-4 py-2 rounded hover:bg-gray-600 transition border ${sortByBookmarks ? 'bg-blue-600 text-white border-blue-400 shadow' : 'text-gray-200 border-transparent'}`}
                  onClick={() => setSortByBookmarks(b => !b)}
                >
                  <i className="fas fa-bookmark mr-2"></i>Most Bookmarked
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}

      <div className="flex min-h-screen flex-col md:flex-row">
        {/* Sidebar for desktop */}
        <aside className="hidden md:flex flex-col w-64 bg-gray-850 border-r border-gray-800 py-8 px-4 min-h-screen justify-between">
          <nav className="flex flex-col gap-4">
            <div className="mb-6">
              <span className="text-lg font-bold tracking-wide text-gray-200 flex items-center gap-2"><i className="fas fa-filter mr-2"></i> Filters</span>
            </div>
            <div>
              <div className="mb-2 font-semibold text-gray-400 flex items-center gap-2"><i className="fas fa-tags"></i> Tags</div>
              {tags.length === 0 ? <div className="text-gray-500">No tags</div> : tags.map(tag => (
                <button
                  key={tag}
                  className={`w-full mb-1 bg-gray-700 text-left px-4 py-2 rounded hover:bg-gray-600 transition border ${selectedTag === tag ? 'bg-blue-600 text-white border-blue-400 shadow' : 'text-gray-200 border-transparent'}`}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                >
                  <i className="fas fa-tag mr-2"></i>{tag}
                </button>
              ))}
            </div>
            <div className="mt-6">
              <div className="mb-2 font-semibold text-gray-400 flex items-center gap-2"><i className="fas fa-calendar-alt"></i> Date</div>
              <button
                className={`w-full mb-1 bg-gray-700 text-left px-4 py-2 rounded hover:bg-gray-600 transition border ${sortByDate === 'newest' ? 'bg-blue-600 text-white border-blue-400 shadow' : 'text-gray-200 border-transparent'}`}
                onClick={() => setSortByDate(sortByDate === 'newest' ? null : 'newest')}
              >
                <i className="fas fa-arrow-down mr-2"></i>Newest
              </button>
              <button
                className={`w-full mb-1 bg-gray-700 text-left px-4 py-2 rounded hover:bg-gray-600 transition border ${sortByDate === 'oldest' ? 'bg-blue-600 text-white border-blue-400 shadow' : 'text-gray-200 border-transparent'}`}
                onClick={() => setSortByDate(sortByDate === 'oldest' ? null : 'oldest')}
              >
                <i className="fas fa-arrow-up mr-2"></i>Oldest
              </button>
            </div>
            <div className="mt-6">
              <div className="mb-2 font-semibold text-gray-400 flex items-center gap-2"><i className="fas fa-bookmark"></i> Bookmarks</div>
              <button
                className={`w-full bg-gray-700 text-left px-4 py-2 rounded hover:bg-gray-600 transition border ${sortByBookmarks ? 'bg-blue-600 text-white border-blue-400 shadow' : 'text-gray-200 border-transparent'}`}
                onClick={() => setSortByBookmarks(b => !b)}
              >
                <i className="fas fa-bookmark mr-2"></i>Most Bookmarked
              </button>
            </div>
          </nav>
        </aside>

        <main className="flex-1 p-2 sm:p-4 md:p-5 overflow-y-auto">
          {loading ? (
            <div className="text-center text-gray-400">Loading snippets...</div>
          ) : error ? (
            <div className="text-center text-red-400">{error}</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
              {finalSnippets.map((snippet) => (
                <SnippetCard
                  key={snippet.id || snippet._id}
                  snippet={mapSnippetForCard(snippet)}
                  userId={userProfile?.id}
                  onDeleteSnippet={handleDeleteSnippet}
                  onClick={() => setSelectedSnippet(mapSnippetForCard(snippet))}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modal for Submit Snippet */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-8 max-w-2xl w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl"
              onClick={() => setShowSubmitModal(false)}
            >
              &times;
            </button>
            <SubmitSnippetForm onSubmit={handleSnippetSubmit} onCancel={() => setShowSubmitModal(false)} />
          </div>
        </div>
      )}

      {selectedSnippet && (
        <SnippetDetailModal
          snippet={selectedSnippet}
          onClose={() => setSelectedSnippet(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-gray-800 rounded-xl p-8 max-w-sm w-full shadow-2xl border border-gray-700 text-center">
            <h2 className="text-2xl font-bold mb-4 text-white">Delete Snippet?</h2>
            <p className="mb-6 text-gray-300">Are you sure you want to delete this snippet? This action cannot be undone.</p>
            <div className="flex justify-center gap-4">
              <button onClick={confirmDeleteSnippet} className="px-6 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold">Delete</button>
              <button onClick={cancelDeleteSnippet} className="px-6 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white font-semibold">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Modal form for submitting a snippet
function SubmitSnippetForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    code: '',
    language: 'JavaScript',
    tags: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const tagsArr = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
    onSubmit({ ...formData, tags: tagsArr });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">Submit a Snippet</h1>
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label htmlFor="language" className="block text-sm font-medium mb-2">Programming Language</label>
        <select
          id="language"
          name="language"
          value={formData.language}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="JavaScript">JavaScript</option>
          <option value="Python">Python</option>
          <option value="Java">Java</option>
          <option value="C++">C++</option>
          <option value="Go">Go</option>
          <option value="Rust">Rust</option>
        </select>
      </div>
      <div>
        <label htmlFor="code" className="block text-sm font-medium mb-2">Code</label>
        <textarea
          id="code"
          name="code"
          value={formData.code}
          onChange={handleChange}
          rows="10"
          className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
          required
        />
      </div>
      <div>
        <label htmlFor="tags" className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
        <input
          type="text"
          id="tags"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="e.g., algorithm, sorting, array"
          className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
        >
          Submit Snippet
        </button>
      </div>
    </form>
  );
}

export default MainFeed; 