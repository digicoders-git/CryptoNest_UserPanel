import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import api from '../services/api';

const TestDemoBalance = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Use wallet activate API for demo balance
      const res = await api.post('/wallet/activate', {
        txHash: '0x' + Array.from({length: 64}, () => 
          Math.floor(Math.random() * 16).toString(16)
        ).join(''),
        walletAddress: '0x' + Array.from({length: 40}, () => 
          Math.floor(Math.random() * 16).toString(16)
        ).join('')
      });
      
      setResponse(res.data);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data || err.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-md mx-auto">
      <h3 className="text-xl font-bold mb-4">Test Wallet Activation</h3>
      
      <div className="space-y-4">
        <button
          onClick={testAPI}
          disabled={loading}
          className="w-full bg-blue-500 text-white py-3 rounded-lg flex items-center justify-center gap-2"
        >
          <FaPlus />
          {loading ? 'Activating...' : 'Activate Wallet'}
        </button>
        
        {response && (
          <div className="bg-green-50 p-3 rounded-lg">
            <h4 className="font-bold text-green-800">Success:</h4>
            <pre className="text-sm">{JSON.stringify(response, null, 2)}</pre>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 p-3 rounded-lg">
            <h4 className="font-bold text-red-800">Error:</h4>
            <pre className="text-sm">{JSON.stringify(error, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestDemoBalance;