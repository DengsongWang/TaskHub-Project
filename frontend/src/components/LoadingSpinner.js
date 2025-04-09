import React from 'react';

const LoadingSpinner = ({ size = 'medium', center = true }) => {
  let spinnerClass = 'spinner-border';
  
  if (size === 'small') {
    spinnerClass += ' spinner-border-sm';
  } else if (size === 'large') {
    spinnerClass += ' spinner-border-lg';
  }
  
  const wrapper = center ? (
    <div className="d-flex justify-content-center my-4">
      <div className={spinnerClass} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  ) : (
    <div className={spinnerClass} role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  );
  
  return wrapper;
};

export default LoadingSpinner;