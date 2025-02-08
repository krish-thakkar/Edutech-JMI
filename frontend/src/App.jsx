// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import CompanyRegistrationForm from './components/CompanyRegistrationForm';
import RegisteredCompanies from './components/RegisteredCompanies';
import DomainChecker from './components/DomainChecker';
import MarketingDashboard from './components/MarketingDashboard';
const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-[#111827]">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/analysis" element={<DomainChecker />} />
          <Route path="/marketing" element={<MarketingDashboard />} />
          <Route path="/register-company" element={<CompanyRegistrationForm />} />
          <Route path="/companies" element={<RegisteredCompanies />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;