import React, { useRef, useEffect } from 'react';
import './OtpInput.css';

const OtpInput = ({ value, onChange }) => {
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  const handleChange = (index, e) => {
    const newValue = e.target.value;
    if (newValue.length <= 1) {
      const newOtp = value.split('');
      newOtp[index] = newValue;
      onChange(newOtp.join(''));
      
      if (newValue && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  return (
    <div className="otp-input-container">
      {[...Array(6)].map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className="otp-input"
        />
      ))}
    </div>
  );
};

export default OtpInput; 