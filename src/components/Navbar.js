import React from 'react';
import { useNavigate } from 'react-router-dom';

function Navbar({ role }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="navbar">
      <div className="navbar-title">JustInTime – FloatFry MRP</div>
      <div className="navbar-right">
        <span className="navbar-role">{role}</span>
        <button className="navbar-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;