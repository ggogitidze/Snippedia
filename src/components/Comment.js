import React, { useState } from 'react';
import { format } from 'date-fns';

const Comment = ({ username, content, isReply, avatar, createdAt, onReply, replies = [] }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');

  // Prefer GitHub avatar if available, fallback to placeholder
  const avatarUrl = avatar && avatar.startsWith('http') ? avatar : 'https://placehold.co/32x32?text=Avatar';

  const handleReply = () => {
    if (onReply && replyText.trim()) {
      onReply(replyText);
      setReplyText('');
      setShowReplyInput(false);
    }
  };

  return (
    <div className={`relative bg-gray-700 rounded-xl p-5 ${isReply ? 'ml-10 pl-6 border-l-2 border-blue-500 before:absolute before:top-0 before:left-2 before:bottom-0 before:w-0.5 before:bg-blue-500' : ''} mb-4 shadow`}>
      <div className="flex items-center mb-2 gap-3">
        <img src={avatarUrl} alt="Commenter Avatar" className="rounded-full w-10 h-10 object-cover border-2 border-gray-600" />
        <div className="flex flex-col">
          <span className="font-semibold text-base text-white leading-tight">{username}</span>
          <span className="text-xs text-gray-400 leading-tight">{createdAt ? format(new Date(createdAt), 'PPP p') : ''}</span>
        </div>
      </div>
      <p className="mb-3 whitespace-pre-line text-gray-200 text-[15px]">{content}</p>
      <div className="flex items-center space-x-2 mt-1">
        <button className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-xs font-medium shadow-sm transition" onClick={() => setShowReplyInput(v => !v)}>Reply</button>
      </div>
      {showReplyInput && (
        <div className="mt-3 ml-2">
          <input
            type="text"
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleReply(); } }}
          />
          <div className="flex gap-2">
            <button className="bg-blue-600 text-white px-4 py-1 rounded-md text-xs font-semibold hover:bg-blue-700 transition" onClick={handleReply}>Reply</button>
            <button className="bg-gray-500 text-white px-3 py-1 rounded-md text-xs font-semibold hover:bg-gray-600 transition" onClick={() => setShowReplyInput(false)}>Cancel</button>
          </div>
        </div>
      )}
      {/* Render replies recursively with same UI */}
      {replies.length > 0 && (
        <div className="mt-3 ml-2">
          {replies.map((reply, idx) => (
            <Comment
              key={idx}
              username={reply.author_username || reply.username}
              content={reply.content}
              avatar={reply.avatar_url || reply.avatar}
              createdAt={reply.created_at || reply.createdAt}
              isReply={true}
              replies={reply.replies}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comment; 