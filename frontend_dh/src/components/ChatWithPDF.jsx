import React, { useState } from 'react';
import { FiUpload, FiSend, FiLoader } from 'react-icons/fi';

const ChatWithPDF = () => {
  const [file, setFile] = useState(null);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Flask backend URL
  const FLASK_URL = 'http://localhost:5500';

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setUploading(true);
    setFile(selectedFile);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`${FLASK_URL}/upload`, {
        method: 'POST',
        body: formData,
        // Remove the default headers for FormData
      });
      
      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, {
          type: 'system',
          content: data.message || 'PDF uploaded successfully! You can now ask questions about it.'
        }]);
      } else {
        throw new Error(data.error || 'Failed to upload file');
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'error',
        content: `Upload error: ${error.message}`
      }]);
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    setMessages(prev => [...prev, { type: 'user', content: query }]);

    try {
      const response = await fetch(`${FLASK_URL}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, {
          type: 'assistant',
          content: data.response
        }]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'error',
        content: `Query error: ${error.message}`
      }]);
    } finally {
      setLoading(false);
      setQuery('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-purple-600 p-4 text-white">
          <h1 className="text-2xl font-bold">Chat with PDF</h1>
          <p className="text-purple-200">Upload a PDF and ask questions about it</p>
        </div>

        {/* File Upload Section */}
        <div className="p-4 border-b">
          <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".pdf"
              className="hidden"
            />
            <div className="flex flex-col items-center">
              <FiUpload className="text-purple-500 text-2xl mb-2" />
              <span className="text-purple-600">
                {uploading ? 'Uploading ...' : file ? file.name : 'Choose a PDF file'}
              </span>
            </div>
          </label>
        </div>

        {/* Chat Messages */}
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-3/4 p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-purple-600 text-white'
                    : message.type === 'error'
                    ? 'bg-red-100 text-red-600'
                    : message.type === 'system'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-center">
              <FiLoader className="animate-spin text-purple-600 text-2xl" />
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question about your PDF..."
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              disabled={!file || uploading}
            />
            <button
              type="submit"
              disabled={!file || uploading || loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-300 transition-colors"
            >
              <FiSend className="text-xl" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatWithPDF;