import React from 'react';
import MHL from '../images/MHL.jpg'; // Assuming this is your logo image path
import './Header.css'; 
const Header = ({ user }) => {
  return (
    <header className="app-header">
      <div className="header-container">
        <img src={MHL} alt="MUSABAHA Logo" className="header-logo" />
        <span className="header-title">MUSABAHA HOMES LTD.</span>
        {/* Optionally, you can show the user’s name or role */}

      </div>
    </header>
  );
};

export default Header;
