import React, { useState, useEffect } from 'react';
import SnippetCard from '../components/SnippetCard';
import Navbar from '../components/Navbar';
import SnippetDetailModal from '../components/SnippetDetailModal';
import { API_URL } from '../App';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('snippets');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snippets, setSnippets] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [selectedSnippet, setSelectedSnippet] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('jwt');
        const res = await fetch(`${API_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token || ''}` }
        });
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        setProfile(data);
        // Fetch user's own snippets
        const sres = await fetch(`${API_URL}/api/user/snippets`, {
          headers: { Authorization: `Bearer ${token || ''}` }
        });
        if (sres.ok) setSnippets(await sres.json());
        // Fetch user's bookmarks
        const bres = await fetch(`${API_URL}/api/user/bookmarks`, {
          headers: { Authorization: `Bearer ${token || ''}` }
        });
        if (bres.ok) setBookmarks(await bres.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const badges = profile?.badges || [];

  const handleSnippetClick = (snippet) => setSelectedSnippet(snippet);

  const renderContent = () => {
    switch (activeTab) {
      case 'snippets':
        return (snippets || []).length === 0 ? (
          <div className="text-gray-400">No snippets yet.</div>
        ) : (
          snippets.map((snippet, index) => (
            <SnippetCard
              key={snippet.id || snippet._id}
              snippet={{
                ...snippet,
                author_username: snippet.author_username,
                author_avatar: snippet.author_avatar,
                author_github: snippet.author_github,
                author_bio: snippet.author_bio,
                id: snippet.id || snippet._id,
              }}
              onClick={() => handleSnippetClick(snippet)}
            />
          ))
        );
      case 'bookmarked':
        return (bookmarks || []).length === 0 ? (
          <div className="text-gray-400">No bookmarks yet.</div>
        ) : (
          bookmarks.map((snippet, index) => (
            <SnippetCard
              key={snippet.id || snippet._id}
              snippet={{
                ...snippet,
                author_username: snippet.author_username,
                author_avatar: snippet.author_avatar,
                author_github: snippet.author_github,
                author_bio: snippet.author_bio,
                id: snippet.id || snippet._id,
              }}
              onClick={() => handleSnippetClick(snippet)}
            />
          ))
        );
      case 'badges':
        return badges.length === 0 ? (
          <div className="text-gray-400">No badges yet.</div>
        ) : (
          badges.map((badge, index) => (
            <div key={index} className="bg-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow">
              <h3 className="font-bold">{badge}</h3>
            </div>
          ))
        );
      default:
        return null;
    }
  };

  if (loading) return <div className="text-center text-gray-400 p-10">Loading profile...</div>;
  if (error) return <div className="text-center text-red-400 p-10">{error}</div>;

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      <Navbar search={''} setSearch={() => {}} showSearch={false} showCreate={false} onLogout={() => { localStorage.removeItem('jwt'); window.location.href = '/login'; }} />
      <div className="p-4 sm:p-10 flex flex-col items-center md:items-start md:flex-row justify-center flex-1">
        <div className="bg-gray-800 rounded-lg p-4 sm:p-10 shadow-lg w-full max-w-6xl">
          <div className="flex flex-col md:flex-row items-center mb-8 md:mb-10">
            <img src={profile?.avatar_url || 'https://placehold.co/200x200?text=Avatar'} alt="User Avatar" className="rounded-full mb-6 md:mb-0 md:mr-10 w-32 h-32 sm:w-48 sm:h-48 object-cover border-4 border-gray-700" />
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">{profile?.username || 'Username'}</h1>
              <p className="text-gray-300 mb-2 text-base sm:text-lg">Bio: {profile?.bio || 'No bio yet.'}</p>
              {profile?.github_url && (
                <button
                  onClick={() => window.open(profile.github_url, '_blank')}
                  className="text-blue-400 hover:underline text-base sm:text-lg mb-2"
                >
                  GitHub Profile
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-10 mb-8">
            <div className="text-center">
              <h2 className="text-lg sm:text-xl font-semibold">Snippets</h2>
              <p className="text-2xl sm:text-3xl font-bold">{(snippets || []).length}</p>
            </div>
            <div className="text-center">
              <h2 className="text-lg sm:text-xl font-semibold">Bookmarks</h2>
              <p className="text-2xl sm:text-3xl font-bold">{(bookmarks || []).length}</p>
            </div>
            <div className="text-center">
              <h2 className="text-lg sm:text-xl font-semibold">Badges</h2>
              <p className="text-2xl sm:text-3xl font-bold">{badges.length}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-6 justify-center">
            <button 
              onClick={() => setActiveTab('snippets')}
              className={`px-4 py-2 rounded ${activeTab === 'snippets' ? 'bg-blue-600' : 'bg-gray-700'} text-white hover:bg-gray-600`}
            >
              Snippets
            </button>
            <button 
              onClick={() => setActiveTab('bookmarked')}
              className={`px-4 py-2 rounded ${activeTab === 'bookmarked' ? 'bg-blue-600' : 'bg-gray-700'} text-white hover:bg-gray-600`}
            >
              Bookmarked
            </button>
            <button 
              onClick={() => setActiveTab('badges')}
              className={`px-4 py-2 rounded ${activeTab === 'badges' ? 'bg-blue-600' : 'bg-gray-700'} text-white hover:bg-gray-600`}
            >
              Badges
            </button>
          </div>
          <div className="mt-6 sm:mt-10 bg-gray-900 rounded-xl shadow-lg p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
      {selectedSnippet && (
        <SnippetDetailModal
          snippet={selectedSnippet}
          onClose={() => setSelectedSnippet(null)}
        />
      )}
    </div>
  );
};

export default ProfilePage; 