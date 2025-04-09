import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-light text-center text-muted py-3 mt-5">
      <div className="container">
        <p className="mb-0">
          &copy; {new Date().getFullYear()} TaskHub - A Task Management System
        </p>
      </div>
    </footer>
  );
};

export default Footer;