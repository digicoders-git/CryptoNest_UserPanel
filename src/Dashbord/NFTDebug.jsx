import React, { useState } from 'react';
import api from '../services/api';

const NFTDebug = () => {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const testEndpoints = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    const results = {};
    const endpoints = [
      { name: 'Marketplace', url: '/nft/marketplace', method: 'GET' },
      { name: 'My NFTs', url: '/nft/my-nfts', method: 'GET' },
      { name: 'Buy NFT', url: '/nft/buy', method: 'POST', data: { nftId: 'ADMIN_BATCH_2_1_1769069975596' } }
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`Testing ${endpoint.name}...`);
        let res;
        if (endpoint.method === 'GET') {
          res = await api.get(endpoint.url);
        } else {
          res = await api.post(endpoint.url, endpoint.data);
        }
        results[endpoint.name] = { success: true, data: res.data };
      } catch (err) {
        results[endpoint.name] = { 
          success: false, 
          error: `${err.response?.status || 'Network'} - ${err.response?.data?.message || err.message}` 
        };
      }
    }
    
    setResponse(results);
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-2xl mx-auto">
      <h3 className="text-xl font-bold mb-4">NFT API Test</h3>
      
      <button
        onClick={testEndpoints}
        disabled={loading}
        className="w-full bg-blue-500 text-white py-3 rounded-lg mb-4 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test All NFT Endpoints'}
      </button>

      {response && (
        <div className="space-y-4">
          {Object.entries(response).map(([name, result]) => (
            <div key={name} className={`p-4 rounded border ${
              result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <h4 className="font-bold mb-2">{name}</h4>
              {result.success ? (
                <div>
                  <p className="text-green-600 mb-2">✅ Success</p>
                  <pre className="text-xs overflow-auto bg-white p-2 rounded">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              ) : (
                <p className="text-red-600">❌ {result.error}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NFTDebug;