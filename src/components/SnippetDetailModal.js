import React, { useState, useEffect } from 'react';
import Comment from './Comment';
import { FaRegThumbsUp, FaBrain, FaTools, FaMedal, FaBookmark } from 'react-icons/fa';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import MonacoEditor from '@monaco-editor/react';
import { API_URL } from '../App';

const SnippetDetailModal = ({ snippet, onClose }) => {
  const [useful, setUseful] = useState(snippet.useful || 0);
  const [smart, setSmart] = useState(snippet.smart || 0);
  const [refactored, setRefactored] = useState(snippet.refactored || 0);
  const [bookmarked, setBookmarked] = useState(snippet.bookmarked || false);
  const [comments, setComments] = useState(snippet.comments || []);
  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  // Fetch latest snippet data (for comments) on open and after comment
  const fetchLatestSnippet = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const res = await fetch(`${API_URL}/api/snippets/${snippet._id}`, {
        headers: { Authorization: `Bearer ${token || ''}` }
      });
      if (res.ok) {
        const data = await res.json();
        setComments(Array.isArray(data.comments) ? data.comments : []);
        setUseful(data.useful || 0);
        setSmart(data.smart || 0);
        setRefactored(data.refactored || 0);
        setBookmarked(Array.isArray(data.bookmarked_by) && data.bookmarked_by.length > 0);
      }
    } catch {}
  };

  useEffect(() => {
    fetchLatestSnippet();
    // eslint-disable-next-line
  }, [snippet._id]);

  const handleReaction = async (type, setFn) => {
    try {
      const token = localStorage.getItem('jwt');
      await fetch(`${API_URL}/api/snippets/${snippet._id}/reaction?type=${type}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token || ''}` }
      });
      setFn(val => val + 1);
      fetchLatestSnippet();
    } catch (err) {
      console.error('Reaction error:', err);
      alert('Failed to react');
    }
  };

  const handleBookmark = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const res = await fetch(`${API_URL}/api/snippets/${snippet._id}/bookmark`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token || ''}` }
      });
      const data = await res.json();
      setBookmarked(data.bookmarked);
      fetchLatestSnippet();
    } catch (err) {
      console.error('Bookmark error:', err);
      alert('Failed to bookmark');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommentError('');
    setCommentLoading(true);
    try {
      const token = localStorage.getItem('jwt');
      const res = await fetch(`${API_URL}/api/snippets/${snippet._id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`
        },
        body: JSON.stringify({ content: newComment })
      });
      if (!res.ok) {
        let msg = 'Failed to add comment';
        try {
          const data = await res.json();
          if (data && data.error) msg = data.error;
        } catch {}
        setCommentError(msg);
        setCommentLoading(false);
        return;
      }
      setNewComment('');
      setCommentLoading(false);
      setCommentError('');
      fetchLatestSnippet();
    } catch (err) {
      setCommentError('Network error. Please try again.');
      setCommentLoading(false);
    }
  };

  // Helper to build nested comment tree
  function buildCommentTree(comments) {
    const map = {};
    const roots = [];
    comments.forEach(c => {
      map[c.id || c._id] = { ...c, replies: [] };
    });
    comments.forEach(c => {
      if (c.parent_id || c.parentId) {
        const parentId = c.parent_id || c.parentId;
        if (map[parentId]) map[parentId].replies.push(map[c.id || c._id]);
      } else {
        roots.push(map[c.id || c._id]);
      }
    });
    return roots;
  }

  const handleReply = async (replyText, parentId) => {
    if (!replyText.trim()) return;
    setCommentError('');
    setCommentLoading(true);
    try {
      const token = localStorage.getItem('jwt');
      const res = await fetch(`${API_URL}/api/snippets/${snippet._id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`
        },
        body: JSON.stringify({ content: replyText, parentId })
      });
      if (!res.ok) {
        let msg = 'Failed to add reply';
        try {
          const data = await res.json();
          if (data && data.error) msg = data.error;
        } catch {}
        setCommentError(msg);
        setCommentLoading(false);
        return;
      }
      setCommentLoading(false);
      setCommentError('');
      fetchLatestSnippet();
    } catch (err) {
      setCommentError('Network error. Please try again.');
      setCommentLoading(false);
    }
  };

  // Ensure comments is always an array for rendering
  const safeComments = Array.isArray(comments) ? comments : [];
  const commentTree = buildCommentTree(safeComments);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-end md:items-center justify-center z-50">
      <div className="bg-gray-800 rounded-t-2xl md:rounded-2xl p-4 sm:p-6 md:p-10 w-full max-w-md md:max-w-2xl relative shadow-2xl border border-gray-700 max-h-[90vh] flex flex-col overflow-y-auto animate-slide-up">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl"
          onClick={onClose}
        >
          &times;
        </button>
        <div className="flex items-center mb-8">
          <img src={snippet.author_avatar || 'https://placehold.co/120x120?text=Avatar'} alt="Author Avatar" className="rounded-full w-32 h-32 object-cover border-4 border-gray-700 mr-6" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-xl text-white">{snippet.author_username || 'Username'}</span>
              {snippet.author_github && (
                <button
                  onClick={() => window.open(snippet.author_github, '_blank')}
                  className="text-blue-400 hover:underline text-sm font-medium"
                >
                  Public Repo
                </button>
              )}
            </div>
            <div className="text-gray-400 text-sm">
              {snippet.created_at && (
                <span>Created {format(new Date(snippet.created_at), 'PPP p')}</span>
              )}
            </div>
          </div>
        </div>
        <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
        <h1 className="text-3xl font-bold mb-4">{snippet.title}</h1>
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Snippet</h2>
          <div className="font-mono bg-gray-700 p-0 rounded-lg overflow-x-auto" style={{ minHeight: 120, maxHeight: 320 }}>
            <MonacoEditor
              height="200px"
              width="100%"
              language={snippet.language === 'cpp' ? 'cpp' : snippet.language}
              theme="vs-dark"
              value={snippet.code}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 15,
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                automaticLayout: true,
                lineNumbers: 'on',
                scrollbar: { vertical: 'auto', horizontal: 'auto' },
              }}
            />
          </div>
          <h2 className="text-xl font-semibold mt-4">Dev Notes</h2>
          <p className="text-gray-300">{snippet.description}</p>
        </div>
        <div className="flex items-center space-x-4 mb-6">
          <button className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center gap-2" onClick={() => handleReaction('useful', setUseful)}>
            <FaRegThumbsUp className="text-yellow-400" /> Useful <span className="text-gray-400">({useful})</span>
          </button>
          <button className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center gap-2" onClick={() => handleReaction('smart', setSmart)}>
            <FaBrain className="text-pink-400" /> Smart <span className="text-gray-400">({smart})</span>
          </button>
          <button className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center gap-2" onClick={() => handleReaction('refactored', setRefactored)}>
            <FaTools className="text-blue-400" /> Refactored <span className="text-gray-400">({refactored})</span>
          </button>
          <FaBookmark
            className={`text-2xl cursor-pointer transition ${bookmarked ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'}`}
            onClick={handleBookmark}
            title={bookmarked ? 'Bookmarked' : 'Bookmark'}
          />
        </div>
        <div className="flex mb-4">
          <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded font-semibold text-sm shadow-sm border border-yellow-300 flex items-center gap-2">
            <FaMedal className="text-yellow-500" /> Snippet Master
          </span>
        </div>
        <h2 className="text-xl font-semibold mb-2">Comments</h2>
        <div className="space-y-4 mb-4">
          {commentTree.length === 0 ? (
            <div className="text-gray-400">No comments yet.</div>
          ) : (
            commentTree.map((comment, index) => (
              <Comment
                key={comment.id || comment._id}
                username={comment.author_username}
                content={comment.content}
                avatar={comment.avatar_url}
                createdAt={comment.created_at}
                isReply={comment.isReply}
                replies={comment.replies}
                onReply={replyText => handleReply(replyText, comment.id || comment._id)}
              />
            ))
          )}
        </div>
        </div>
        <form onSubmit={handleAddComment} className="flex space-x-2 mt-4 pt-4 border-t border-gray-700">
          <input
            type="text"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white"
            disabled={commentLoading}
          />
          <button type="submit" className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white" disabled={commentLoading}>
            {commentLoading ? 'Posting...' : 'Comment'}
          </button>
        </form>
        {commentError && <div className="text-red-400 mt-2">{commentError}</div>}
      </div>
    </div>
  );
};

export default SnippetDetailModal; 