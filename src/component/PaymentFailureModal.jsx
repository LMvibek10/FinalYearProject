import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaHome, FaRedo } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const PaymentFailureModal = ({ isOpen, onClose, errorMessage }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="relative"
            >
              <div className="w-24 h-24 bg-red-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <FaTimes className="text-red-500 text-5xl" />
              </div>
            </motion.div>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-gray-800 mb-3"
            >
              Payment Failed
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 mb-8 text-lg"
            >
              {errorMessage || "We couldn't process your payment. Please try again."}
            </motion.p>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col gap-4"
            >
              <button
                onClick={() => navigate('/booking')}
                className="bg-red-500 text-white px-8 py-3 rounded-xl hover:bg-red-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 font-semibold text-lg shadow-lg hover:shadow-xl"
              >
                <FaRedo className="text-xl" />
                Try Again
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-gray-500 text-white px-8 py-3 rounded-xl hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 font-semibold text-lg shadow-lg hover:shadow-xl"
              >
                <FaHome className="text-xl" />
                Go to Homepage
              </button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PaymentFailureModal; 