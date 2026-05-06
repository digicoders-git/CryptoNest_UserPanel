import React, { useState } from 'react';
import api from '../services/api';

const EndpointTest = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (endpoint, method = 'GET', data = null) => {
    setLoading(true);
    try {
      let response;
      if (method === 'GET') {
        response = await api.get(endpoint);
      } else {
        response = await api.post(endpoint, data);
      }
      
      setResults(prev => ({
        ...prev,
        [endpoint]: { success: true, data: response.data }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [endpoint]: { 
          success: false, 
          error: error.response?.status + ' - ' + (error.response?.data?.message || error.message)
        }
      }));
    }
    setLoading(false);
  };

  const endpoints = [
    { path: '/nft/marketplace', method: 'GET' },
    { path: '/nft/my-nfts', method: 'GET' },
    { path: '/nft/buy', method: 'POST', data: { nftId: 'test' } },
    { path: '/nft/purchase', method: 'POST', data: { nftId: 'test' } },
    { path: '/nft/list', method: 'GET' },
    { path: '/nfts', method: 'GET' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">NFT Endpoint Test</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {endpoints.map((endpoint) => (
          <button
            key={endpoint.path}
            onClick={() => testEndpoint(endpoint.path, endpoint.method, endpoint.data)}
            disabled={loading}
            className="bg-blue-500 text-white p-3 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {endpoint.method} {endpoint.path}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {Object.entries(results).map(([endpoint, result]) => (
          <div key={endpoint} className={`p-4 rounded ${
            result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          } border`}>
            <h3 className="font-bold mb-2">{endpoint}</h3>
            {result.success ? (
              <pre className="text-sm overflow-auto">{JSON.stringify(result.data, null, 2)}</pre>
            ) : (
              <p className="text-red-600">{result.error}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EndpointTest;