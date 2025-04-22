import React, { useRef, useState, useEffect } from 'react';
import './OtpInput.css';

const OtpInput = ({ length = 6, onComplete, value, onChange }) => {
  const [otp, setOtp] = useState(Array(length).fill(''));
  const inputRefs = useRef([]);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = Array(length).fill(null).map((_, index) => 
      inputRefs.current[index] || React.createRef()
    );
  }, [length]);

  // Focus first input when component mounts
  useEffect(() => {
    // Small delay to ensure refs are initialized
    const timer = setTimeout(() => {
      if (inputRefs.current[0]?.current) {
        inputRefs.current[0].current.focus();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste event
      const pastedData = value.split('');
      const newOtp = [...otp];
      pastedData.forEach((digit, idx) => {
        if (idx < length) {
          newOtp[idx] = digit;
        }
      });
      setOtp(newOtp);
      onChange(newOtp.join(''));
      if (newOtp.every(digit => digit !== '')) {
        onComplete(newOtp.join(''));
      }
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    onChange(newOtp.join(''));

    // Move to next input if value is entered
    if (value && index < length - 1) {
      // Small delay to ensure the next input is ready
      setTimeout(() => {
        if (inputRefs.current[index + 1]?.current) {
          inputRefs.current[index + 1].current.focus();
        }
      }, 50);
    } else if (newOtp.every(digit => digit !== '')) {
      onComplete(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Small delay to ensure the previous input is ready
      setTimeout(() => {
        if (inputRefs.current[index - 1]?.current) {
          inputRefs.current[index - 1].current.focus();
        }
      }, 50);
    }
  };

  return (
    <div className="otp-input-container">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={inputRefs.current[index]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className="otp-input"
          aria-label={`OTP digit ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default OtpInput; 