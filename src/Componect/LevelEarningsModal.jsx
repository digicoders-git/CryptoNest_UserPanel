import React from "react";
import { FaTimes, FaUsers, FaDollarSign } from "react-icons/fa";

const LevelEarningsModal = ({ isOpen, onClose, levelEarnings }) => {
  if (!isOpen) return null;

  const totalEarnings = levelEarnings.reduce((sum, level) => sum + level.amount, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Level Earnings Details</h2>
            <p className="text-sm text-gray-600 mt-1">
              Total Earned: <span className="font-semibold text-green-600">${totalEarnings}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <FaTimes className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            {levelEarnings.map((level, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Level {level.level}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {level.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      ${level.amount}
                    </p>
                    <p className="text-xs text-gray-500">
                      {level.date}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <FaUsers className="text-blue-500 text-xs" />
                    <span className="text-gray-600">
                      Members: <strong>{level.members}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaDollarSign className="text-green-500 text-xs" />
                    <span className="text-gray-600">
                      Commission: <strong>{level.commission}%</strong>
                    </span>
                  </div>
                </div>

                {level.transactions && level.transactions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">Recent Transactions:</p>
                    <div className="space-y-1">
                      {level.transactions.slice(0, 3).map((tx, txIndex) => (
                        <div key={txIndex} className="flex justify-between text-xs">
                          <span className="text-gray-600">{tx.from}</span>
                          <span className="text-green-600 font-medium">${tx.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {levelEarnings.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No level earnings yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Start referring members to earn from different levels
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">
              Active Levels: {levelEarnings.filter(l => l.amount > 0).length}/10
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#0f7a4a] text-white rounded-lg hover:bg-green-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelEarningsModal;