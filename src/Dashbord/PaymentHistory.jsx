import React, { useState, useEffect } from 'react';
import { FaHistory, FaArrowUp, FaArrowDown, FaFilter, FaSearch } from 'react-icons/fa';

const PaymentHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, filter, searchTerm]);

  const loadTransactions = () => {
    const stored = localStorage.getItem('demoTransactions');
    const txs = stored ? JSON.parse(stored) : [];
    setTransactions(txs);
  };

  const filterTransactions = () => {
    let filtered = transactions;

    // Filter by type
    if (filter !== 'all') {
      filtered = filtered.filter(tx => tx.type === filter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(tx => 
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.method?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  };

  const getTransactionIcon = (type) => {
    return type === 'credit' ? (
      <FaArrowDown className="text-green-600" />
    ) : (
      <FaArrowUp className="text-red-600" />
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaHistory className="text-[#0f7a4a]" size={20} />
          <h2 className="text-2xl font-bold text-gray-800">Payment History</h2>
        </div>
        <div className="text-sm text-gray-600">
          {filteredTransactions.length} transactions
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f7a4a] focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f7a4a] focus:border-transparent"
            >
              <option value="all">All Transactions</option>
              <option value="credit">Money Added</option>
              <option value="debit">Money Spent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl border border-gray-100">
        {filteredTransactions.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-gray-100">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {transaction.description}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{new Date(transaction.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{new Date(transaction.date).toLocaleTimeString()}</span>
                        {transaction.method && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{transaction.method}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-lg font-semibold ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                    </div>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      getStatusColor(transaction.status)
                    }`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <FaHistory className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-500">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Your payment history will appear here'
              }
            </p>
          </div>
        )}
      </div>

      {/* Summary */}
      {transactions.length > 0 && (
        <div className="bg-gradient-to-r from-[#0f7a4a] to-green-600 p-6 rounded-xl text-white">
          <h3 className="text-lg font-semibold mb-4">Transaction Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-green-100">Total Added</p>
              <p className="text-2xl font-bold">
                ₹{transactions
                  .filter(tx => tx.type === 'credit')
                  .reduce((sum, tx) => sum + tx.amount, 0)
                  .toFixed(2)
                }
              </p>
            </div>
            <div>
              <p className="text-green-100">Total Spent</p>
              <p className="text-2xl font-bold">
                ₹{transactions
                  .filter(tx => tx.type === 'debit')
                  .reduce((sum, tx) => sum + tx.amount, 0)
                  .toFixed(2)
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;