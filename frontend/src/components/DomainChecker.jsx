import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, AlertCircle } from 'lucide-react';

const DomainChecker = () => {
  const [domain, setDomain] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch('http://localhost:9000/generate-strategy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ domain }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(data);
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Failed to check domain');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert markdown-style text to HTML
  const formatText = (text) => {
    if (!text) return '';
    return text.split('\n').map((line, index) => (
      <p key={index} className="mb-2">
        {line.startsWith('*') ? (
          <span className="ml-4 block">{line}</span>
        ) : line}
      </p>
    ));
  };

  // Helper function to render market research
  const renderMarketResearch = (research) => {
    if (!research || !Array.isArray(research)) return null;
    return research.map((item, index) => (
      <div key={index} className="mb-6 last:mb-0">
        <h3 className="text-lg font-medium text-blue-400 mb-2">{item.title}</h3>
        <p className="text-gray-300 mb-2">{item.content}</p>
        <p className="text-sm text-gray-500">Source: {item.source}</p>
      </div>
    ));
  };

  // Helper function to render budget allocation
  const renderBudgetAllocation = (budget) => {
    if (!budget) return null;
    return Object.entries(budget).map(([channel, amount]) => (
      <div key={channel} className="flex justify-between items-center py-2 border-b border-gray-700">
        <span className="capitalize">{channel.replace(/_/g, ' ')}</span>
        <span className="font-semibold">{amount}%</span>
      </div>
    ));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gray-900 text-white p-8"
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Marketing Strategy Generator</h1>
        
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-4">
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="Enter your industry (e.g., edtech, healthcare)..."
              className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              Generate Strategy
            </motion.button>
          </div>
        </form>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 mb-6 rounded-lg bg-red-900/50 border border-red-700 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-200">{error}</p>
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Industry Overview */}
            <div className="p-6 rounded-lg bg-gray-800 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Industry Overview</h2>
              <p className="text-gray-300 capitalize">{result.domain}</p>
            </div>

            {/* Market Research */}
            <div className="p-6 rounded-lg bg-gray-800 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Market Research Insights</h2>
              <div className="text-gray-300">
                {renderMarketResearch(result.market_research)}
              </div>
            </div>

            {/* Budget Allocation */}
            <div className="p-6 rounded-lg bg-gray-800 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Budget Allocation</h2>
              <div className="text-gray-300">
                {renderBudgetAllocation(result.budget_allocation)}
              </div>
            </div>

            {/* Data Analysis */}
            <div className="p-6 rounded-lg bg-gray-800 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Data Analysis</h2>
              <div className="text-gray-300 whitespace-pre-line">
                {result.data_analysis}
              </div>
            </div>

            {/* Final Strategy */}
            <div className="p-6 rounded-lg bg-gray-800 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Marketing Strategy</h2>
              <div className="text-gray-300 whitespace-pre-line">
                {result.final_strategy}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default DomainChecker;