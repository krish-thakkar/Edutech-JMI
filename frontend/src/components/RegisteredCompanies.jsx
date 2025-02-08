import { useState, useEffect } from 'react';
import { Building2, Mail } from 'lucide-react';

const RegisteredCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState('');

  const fetchCompanies = async () => {
    try {
      setError('');
      const response = await fetch('http://localhost:3000/api/companies');
      if (!response.ok) {
        throw new Error('Failed to fetch companies');
      }
      const { data } = await response.json();
      setCompanies(data);
    } catch (error) {
      setError('Failed to load companies. Please try again later.');
      console.error('Error fetching companies:', error);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700">
      {error && (
        <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Registered Companies</h2>
        <p className="text-gray-400">Browse through our network of registered companies</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <div key={company._id} className="bg-gray-700 rounded-lg p-6 border border-gray-600 hover:border-gray-500 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">{company.companyName}</h3>
                <p className="text-gray-400 text-sm">{company.domain}</p>
              </div>
              <Building2 className="h-6 w-6 text-blue-400" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-gray-300">
                <Mail className="h-4 w-4 mr-2" />
                <span className="text-sm">{company.email}</span>
              </div>
              <p className="text-gray-400 text-sm line-clamp-3">
                {company.description || 'No description provided'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RegisteredCompanies;