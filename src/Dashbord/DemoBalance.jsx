import React, { useState } from 'react';
import { FaPlus, FaCoins, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import Swal from 'sweetalert2';
import api from '../services/api';

const DemoBalance = ({ onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);

  const addDemoBalance = async () => {
    if (!amount || amount <= 0) {
      Swal.fire('Error', 'Please enter valid amount', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/admin/demo-add-balance', {
        amount: parseFloat(amount),
        type: 'credit'
      });

      console.log('API Response:', response.data);

      if (response.data.success) {
        setBalance(response.data.newBalance);
        Swal.fire({
          icon: 'success',
          title: 'Balance Added!',
          text: response.data.message,
          confirmButtonColor: '#0f7a4a'
        });
        setAmount('');
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('API Error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to add balance';
      Swal.fire('Error', errorMsg, 'error');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <FaCoins className="text-[#0f7a4a] text-2xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Demo Balance</h2>
        <p className="text-gray-600">Add instant balance for testing</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount ($)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f7a4a] focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[10, 50, 100, 500].map((preset) => (
            <button
              key={preset}
              onClick={() => setAmount(preset.toString())}
              className="p-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-[#0f7a4a] transition-colors"
            >
              ${preset}
            </button>
          ))}
        </div>

        <button
          onClick={addDemoBalance}
          disabled={loading || !amount}
          className="w-full bg-[#0f7a4a] text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <FaPlus />
              Add ${amount || '0'}
            </>
          )}
        </button>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Features</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>✅ Instant Balance - No real payment</li>
            <li>✅ All Features Work - NFT, packages, withdrawals</li>
            <li>✅ Transaction Records - Proper audit trail</li>
            <li>✅ Unlimited Amounts - Add any amount</li>
          </ul>
        </div>

        {balance > 0 && (
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-green-800 font-medium">Current Balance</p>
            <p className="text-2xl font-bold text-green-600">${balance.toFixed(2)}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoBalance;