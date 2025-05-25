import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaHome, FaListAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import './PaymentSuccess.css'; // Import the new CSS file

const PaymentSuccessModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleNavigation = (path) => {
    onClose(); // Close the modal first
    navigate(path);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="payment-success-modal-overlay"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="payment-success-modal-content"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="payment-success-icon-container"
            >
              <FaCheckCircle className="payment-success-icon" />
            </motion.div>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="payment-success-title"
            >
              Payment Successful!
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="payment-success-message"
            >
              Your payment has been processed successfully. Thank you for your booking!
            </motion.p>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="payment-success-buttons"
            >
              <button
                onClick={() => handleNavigation('/')}
                className="payment-success-button payment-success-button-green"
              >
                <FaHome className="payment-success-button-icon" />
                Go to Homepage
              </button>
              <button
                onClick={() => handleNavigation('/user/bookings')}
                className="payment-success-button payment-success-button-blue"
              >
                <FaListAlt className="payment-success-button-icon" />
                View My Bookings
              </button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PaymentSuccessModal; 