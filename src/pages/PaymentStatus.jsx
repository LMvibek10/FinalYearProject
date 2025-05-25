import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PaymentSuccessModal from '../component/PaymentSuccessModal';
import PaymentFailureModal from '../component/PaymentFailureModal';
import axios from 'axios';
import './PaymentStatus.css';

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyPaymentStatus = async () => {
      try {
        const status = searchParams.get('status');
        const transactionIdFromUrl = searchParams.get('transaction_id');
        const pidxFromUrl = searchParams.get('pidx');
        const message = searchParams.get('message');

        // Determine the identifier to use for verification, prioritizing pidx
        const identifierToVerify = pidxFromUrl || transactionIdFromUrl;

        console.log('Frontend verifying payment status:');
        console.log('Identifier from URL (pidx or transaction_id):', identifierToVerify);

        if (!identifierToVerify) {
          setErrorMessage('Payment identifier not found in URL.');
          setShowFailureModal(true);
          setIsLoading(false);
          console.error('Error: Payment identifier (pidx or transaction_id) not found in URL.');
          return;
        }

        // Make API call to verify payment status
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/payment/verify/${identifierToVerify}`);
        
        console.log('Backend verification response:', response.data);

        if (response.data.success) {
          const paymentStatus = response.data.payment.status;
          if (paymentStatus === 'success') {
            setShowSuccessModal(true);
          } else {
            setErrorMessage(response.data.payment.message || 'Payment verification failed');
            setShowFailureModal(true);
          }
        } else {
          // If verification fails, check URL status as fallback
          if (status === 'success') {
            setShowSuccessModal(true);
          } else {
            setErrorMessage(response.data.message || 'Payment verification failed');
            setShowFailureModal(true);
          }
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        // If verification fails, check URL status as fallback
        const status = searchParams.get('status');
        if (status === 'success') {
          setShowSuccessModal(true);
        } else {
          setErrorMessage(error.response?.data?.message || 'Failed to verify payment status');
          setShowFailureModal(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyPaymentStatus();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying payment status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-status-container">
      <PaymentSuccessModal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)} 
      />
      <PaymentFailureModal 
        isOpen={showFailureModal} 
        onClose={() => setShowFailureModal(false)}
        errorMessage={errorMessage}
      />
    </div>
  );
};

export default PaymentStatus; 