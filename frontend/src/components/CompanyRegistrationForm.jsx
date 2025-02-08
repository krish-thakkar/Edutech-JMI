import { useState } from 'react';
import { Building2, Mail, Globe, FileText, Loader2, CheckCircle } from 'lucide-react';

const CompanyRegistrationForm = ({ onCompanyRegistered }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    companyName: '',
    domain: '',
    description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:3000/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to register company');
      }
      
      setFormData({
        email: '',
        companyName: '',
        domain: '',
        description: ''
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      if (onCompanyRegistered) {
        onCompanyRegistered();
      }
    } catch (error) {
      setError(error.message || 'Failed to register company. Please try again.');
      console.error('Error registering company:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-8 border border-gray-700 max-w-lg w-full">
        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Register Your Company</h2>
          <p className="text-gray-400">Join our platform and showcase your business to the world</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {[{ name: 'companyName', placeholder: 'Company Name', Icon: Building2 },
              { name: 'email', placeholder: 'Email Address', type: 'email', Icon: Mail },
              { name: 'domain', placeholder: 'Domain (e.g., company.com)', Icon: Globe }].map(({ name, placeholder, type = 'text', Icon }) => (
                <div key={name} className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    required
                  />
                </div>
            ))}
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Company Description"
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[120px] resize-y"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                Registering...
              </>
            ) : success ? (
              <>
                <CheckCircle className="-ml-1 mr-2 h-5 w-5" />
                Registration Successful!
              </>
            ) : (
              'Register Company'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompanyRegistrationForm;
