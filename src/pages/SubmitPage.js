import React, { useState } from 'react';
import MonacoEditor from '@monaco-editor/react';

const SubmitPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    language: 'javascript',
    tags: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement form submission logic
    console.log('Form submitted:', formData);
  };

  return (
    <div className="p-10 bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg p-6 shadow-lg">
        <h1 className="text-3xl font-bold mb-6">Submit a Snippet</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title
            </label>
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
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description
            </label>
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
            <label htmlFor="language" className="block text-sm font-medium mb-2">
              Programming Language
            </label>
            <select
              id="language"
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
            </select>
          </div>

          <div>
            <label htmlFor="code" className="block text-sm font-medium mb-2">
              Code
            </label>
            <div className="w-full bg-gray-700 border border-gray-600 rounded" style={{ minHeight: 240, maxHeight: 400, overflow: 'hidden' }}>
              <MonacoEditor
                height="240px"
                width="100%"
                language={formData.language === 'cpp' ? 'cpp' : formData.language}
                theme="vs-dark"
                value={formData.code}
                options={{
                  minimap: { enabled: false },
                  fontSize: 15,
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  automaticLayout: true,
                  lineNumbers: 'on',
                  scrollbar: { vertical: 'auto', horizontal: 'auto' },
                }}
                onChange={value => setFormData(prev => ({ ...prev, code: value || '' }))}
              />
            </div>
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium mb-2">
              Tags (comma-separated)
            </label>
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
              onClick={() => window.history.back()}
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
      </div>
    </div>
  );
};

export default SubmitPage; 