import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const LandingPage = () => {
  const rightContent = (
    <div className="flex items-center gap-4">
      <Link to="/feed" className="hover:underline text-base font-medium py-2">Explore Snippets</Link>
      <Link to="/login" className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-500 text-base font-semibold flex items-center justify-center">Login with GitHub</Link>
    </div>
  );
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Navbar rightContent={rightContent} hideRight />
      <main className="flex flex-col items-center mt-12 px-4">
        <section className="text-center max-w-3xl w-full">
          <h1 className="text-5xl font-extrabold mb-6 leading-tight">Discover and share reusable code snippets & dev wisdom.</h1>
          <p className="text-xl mb-10 text-gray-300">GitHub-powered. Community-driven.</p>
          <img 
            src="/feed-preview.png" 
            alt="A mockup of the Snippedia feed showing various code snippets shared by users." 
            className="rounded-lg shadow-lg mb-10 mx-auto"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            <div className="flex flex-col items-center">
              <i className="fab fa-github text-4xl mb-2"></i>
              <h2 className="font-semibold text-lg mb-1">GitHub Login</h2>
              <p className="text-center text-gray-400">Seamlessly log in with your GitHub account.</p>
            </div>
            <div className="flex flex-col items-center">
              <i className="fas fa-share-alt text-4xl mb-2"></i>
              <h2 className="font-semibold text-lg mb-1">Share Wisdom</h2>
              <p className="text-center text-gray-400">Contribute your own snippets and tips.</p>
            </div>
            <div className="flex flex-col items-center">
              <i className="fas fa-bookmark text-4xl mb-2"></i>
              <h2 className="font-semibold text-lg mb-1">Bookmark Tools</h2>
              <p className="text-center text-gray-400">Save your favorite snippets for easy access.</p>
            </div>
          </div>
          <Link 
            to="/login" 
            className="bg-blue-600 text-white px-8 py-3 rounded hover:bg-blue-500 text-lg font-bold shadow"
          >
            Get Started
          </Link>
        </section>
      </main>
    </div>
  );
};

export default LandingPage; 