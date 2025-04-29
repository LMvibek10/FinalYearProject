import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PaymentSuccessModal from '../component/PaymentSuccessModal';
import PaymentFailureModal from '../component/PaymentFailureModal';

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const status = searchParams.get('status');
    const message = searchParams.get('message');

    if (status === 'success') {
      setShowSuccessModal(true);
    } else if (status === 'failed') {
      setErrorMessage(message || 'Payment Unsuccessful');
      setShowFailureModal(true);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-100">
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