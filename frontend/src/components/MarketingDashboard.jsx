import React, { useState } from 'react';
import { Send, Image, Twitter, MessageCircle } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5600';

const MarketingDashboard = () => {
  const [formData, setFormData] = useState({
    promoted_product: '',
    company_name: '',
    company_description: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [imageKey, setImageKey] = useState(0); // For forcing image refresh

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/generate-ad`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      // Force image refresh by updating the key
      setImageKey(prev => prev + 1);
      setResult(data);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err.message || 'Failed to generate campaign. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to get the local image path
  const getLocalImagePath = (filename) => {
    if (!filename) return '';
    // The image should be in the same directory as where Flask saved it
    return `${filename}?${imageKey}`; // Add key to force refresh
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-blue-400">
          Marketing Campaign Generator
        </h1>
        
        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6 mb-8 bg-gray-800 p-6 rounded-lg">
          <div>
            <label className="block text-sm font-medium mb-2">
              Product Name
            </label>
            <input
              type="text"
              name="promoted_product"
              value={formData.promoted_product}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Company Name
            </label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Company Description
            </label>
            <textarea
              name="company_description"
              value={formData.company_description}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none h-32"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Generating Campaign...
              </>
            ) : (
              <>
                <Send size={20} />
                Generate Campaign
              </>
            )}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6 bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-blue-400 mb-4">
              Generated Campaign
            </h2>
            
            {/* Generated Image */}
            {result.image_path && (
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Image size={20} />
                  Generated Image
                </h3>
                <div className="relative rounded-lg overflow-hidden border border-gray-700">
                  <img
                    src={getLocalImagePath(result.image_path)}
                    alt="Generated campaign"
                    className="w-full h-auto"
                    onError={(e) => {
                      console.error('Error loading image');
                      e.target.src = 'placeholder.png'; // You can add a placeholder image
                    }}
                  />
                </div>
              </div>
            )}
            
            {/* Instagram Caption */}
            <div>
              <h3 className="text-sm font-medium mb-2">Instagram Caption</h3>
              <div className="bg-gray-700 p-4 rounded">
                {result.caption}
              </div>
            </div>
            
            {/* Hashtags */}
            <div>
              <h3 className="text-sm font-medium mb-2">Hashtags</h3>
              <div className="bg-gray-700 p-4 rounded">
                {result.hashtags}
              </div>
            </div>
            
            {/* Distribution Status */}
            <div className="flex gap-4 mt-6">
              <div className="flex items-center gap-2 text-green-400">
                <Twitter size={20} />
                <span>Posted to Twitter</span>
              </div>
              <div className="flex items-center gap-2 text-green-400">
                <MessageCircle size={20} />
                <span>Sent via WhatsApp</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketingDashboard;