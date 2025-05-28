import React from 'react';
import Navbar from '../components/Navbar';
import { API_URL, FRONTEND_URL } from '../App';

// IMPORTANT: Set REACT_APP_GITHUB_CLIENT_ID in your frontend .env file at the project root.
const GITHUB_CLIENT_ID = process.env.REACT_APP_GITHUB_CLIENT_ID;
const REDIRECT_URI = `${API_URL}/auth/github/callback`;
const githubAuthUrl = GITHUB_CLIENT_ID
  ? `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=user:email`
  : '#';

const LoginPage = () => {
  return (
    <div className="bg-gray-900 min-h-screen flex flex-col">
      <Navbar showSearch={false} showCreate={false} hideRight={true} />
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center bg-gray-800 p-10 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-md mx-auto">
          <h1 className="text-3xl font-extrabold text-white mb-6 tracking-tight">Login to start sharing your dev knowledge.</h1>
          {GITHUB_CLIENT_ID ? (
            <a 
              href={githubAuthUrl}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center text-lg font-semibold shadow transition"
            >
              <i className="fab fa-github mr-2 text-xl"></i>
              Login with GitHub
            </a>
          ) : (
            <div className="text-red-400 font-bold">GitHub Client ID is not set. Please check your .env file.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 