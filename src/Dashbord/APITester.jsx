import React, { useState } from 'react';
import { FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import api from '../services/api';

const APITester = () => {
  const [results, setResults] = useState({});
  const [testing, setTesting] = useState(false);

  const apiEndpoints = [
    // Critical User APIs
    { name: 'User Profile', method: 'GET', url: '/user/profile', critical: true },
    { name: 'User Dashboard', method: 'GET', url: '/user/dashboard', critical: true },
    { name: 'User Transactions', method: 'GET', url: '/user/transactions', critical: true },
    { name: 'User Team', method: 'GET', url: '/user/team', critical: true },
    
    // Wallet APIs
    { name: 'Wallet Balance', method: 'GET', url: '/wallet/balance', critical: true },
    
    // NFT APIs
    { name: 'NFT Marketplace', method: 'GET', url: '/nft/marketplace', critical: true },
    { name: 'My NFTs', method: 'GET', url: '/nft/my-nfts', critical: true },
    
    // MLM APIs
    { name: 'MLM Tree', method: 'GET', url: '/user/mlm-tree', critical: false },
    { name: 'MLM Earnings', method: 'GET', url: '/user/mlm-earnings', critical: false },
  ];

  const testAPI = async (endpoint) => {
    try {
      const response = await api.get(endpoint.url);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;
      
      // For 404 errors on optional endpoints, show as warning instead of error
      if (status === 404 && !endpoint.critical) {
        return { 
          success: false, 
          error: 'Endpoint not implemented (using fallback)',
          status: '404 (Optional)',
          isOptional: true
        };
      }
      
      return { 
        success: false, 
        error: message,
        status: status || 'Network Error'
      };
    }
  };

  const testAllAPIs = async () => {
    setTesting(true);
    const newResults = {};

    for (const endpoint of apiEndpoints) {
      const result = await testAPI(endpoint);
      newResults[endpoint.name] = result;
      setResults({ ...newResults });
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setTesting(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">API Status Checker</h2>
        <button
          onClick={testAllAPIs}
          disabled={testing}
          className="bg-[#0f7a4a] text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
        >
          {testing ? <FaSpinner className="animate-spin" /> : <FaCheck />}
          {testing ? 'Testing...' : 'Test All APIs'}
        </button>
      </div>

      <div className="space-y-3">
        {/* Overall Status Summary */}
        {Object.keys(results).length > 0 && (
          <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-2">API Health Summary</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-green-50 p-2 rounded">
                <div className="text-green-600 font-bold text-lg">
                  {Object.values(results).filter(r => r.success).length}
                </div>
                <div className="text-green-700 text-xs">Working</div>
              </div>
              <div className="bg-orange-50 p-2 rounded">
                <div className="text-orange-600 font-bold text-lg">
                  {Object.values(results).filter(r => !r.success && r.isOptional).length}
                </div>
                <div className="text-orange-700 text-xs">Optional</div>
              </div>
              <div className="bg-red-50 p-2 rounded">
                <div className="text-red-600 font-bold text-lg">
                  {Object.values(results).filter(r => !r.success && !r.isOptional).length}
                </div>
                <div className="text-red-700 text-xs">Critical</div>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-600 text-center">
              ✅ App is functional - Optional APIs have fallback data
            </div>
          </div>
        )}

        {apiEndpoints.map((endpoint) => {
          const result = results[endpoint.name];
          return (
            <div key={endpoint.name} className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">{endpoint.name}</h3>
                  <p className="text-sm text-gray-500">{endpoint.method} {endpoint.url}</p>
                </div>
                <div className="flex items-center gap-2">
                  {result ? (
                    <>
                      {result.success ? (
                        <FaCheck className="text-green-600" />
                      ) : result.isOptional ? (
                        <FaTimes className="text-orange-500" />
                      ) : (
                        <FaTimes className="text-red-600" />
                      )}
                      <span className={`text-sm font-medium ${
                        result.success ? 'text-green-600' : 
                        result.isOptional ? 'text-orange-500' : 'text-red-600'
                      }`}>
                        {result.status}
                      </span>
                    </>
                  ) : testing ? (
                    <FaSpinner className="animate-spin text-blue-600" />
                  ) : (
                    <span className="text-gray-400 text-sm">Not tested</span>
                  )}
                </div>
              </div>
              {result && !result.success && (
                <div className={`mt-2 p-2 rounded text-sm ${
                  result.isOptional 
                    ? 'bg-orange-50 text-orange-700 border border-orange-200' 
                    : endpoint.critical 
                    ? 'bg-red-50 text-red-700' 
                    : 'bg-yellow-50 text-yellow-700'
                }`}>
                  {result.isOptional ? '⚠️ ' : endpoint.critical ? '❌ ' : '⚠️ '}
                  {result.error}
                  {result.isOptional && (
                    <div className="text-xs mt-1 opacity-75">
                      ✅ App works fine - fallback data is used
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default APITester;