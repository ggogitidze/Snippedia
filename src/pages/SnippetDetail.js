import React from 'react';
import { useParams } from 'react-router-dom';
import Comment from '../components/Comment';

const SnippetDetail = () => {
  const comments = [
    {
      username: "Commenter 1",
      content: "This snippet is really helpful! Thanks for sharing!",
      isReply: false
    },
    {
      username: "Commenter 2",
      content: "Great function! I made a small adjustment for handling edge cases.",
      isReply: true
    }
  ];

  return (
    <div className="p-10 bg-gray-900 min-h-screen">
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h1 className="text-3xl font-bold mb-4">Snippet Title</h1>
        
        <div className="flex items-center mb-4">
          <img src="https://placehold.co/40x40?text=Avatar" alt="Author Avatar" className="rounded-full mr-2" />
          <div>
            <p className="font-semibold">Username</p>
            <button 
              onClick={() => window.open('https://github.com/username', '_blank')}
              className="text-blue-400 hover:underline"
            >
              Public Repo
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold">Snippet</h2>
          <pre className="font-mono bg-gray-700 p-4 rounded-lg overflow-x-auto">
            <code>{`const add = (a, b) => a + b;`}</code>
          </pre>
          
          <h2 className="text-xl font-semibold mt-4">Dev Notes</h2>
          <p className="text-gray-300">
            This function adds two numbers together. It is a pure function and can be reused across different modules.
          </p>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <button className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600">
            👍 Useful <span className="text-gray-400">(10)</span>
          </button>
          <button className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600">
            🧠 Smart <span className="text-gray-400">(5)</span>
          </button>
          <button className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600">
            🛠 Refactored <span className="text-gray-400">(2)</span>
          </button>
          <i className="fas fa-bookmark text-gray-400 hover:text-blue-500 cursor-pointer"></i>
        </div>

        <div className="flex mb-4">
          <span className="bg-yellow-500 text-black px-2 py-1 rounded">🏅 Snippet Master</span>
        </div>

        <h2 className="text-xl font-semibold mb-2">Comments</h2>
        <div className="space-y-4">
          {comments.map((comment, index) => (
            <Comment key={index} {...comment} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SnippetDetail; 