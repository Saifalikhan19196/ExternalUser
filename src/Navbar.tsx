import React from "react";
import './Navbar.css';
import logo from "./assets/JOSLOC.png";
import { useNavigate } from 'react-router-dom';


const Navbar: React.FC = () => {
     const navigate = useNavigate();

    const Exit = () => {
        navigate('/');
    };
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    e.currentTarget.onerror = null; // Prevent infinite loop
    e.currentTarget.src =
      "https://aljomaihshell0.sharepoint.com/SiteAssets/JOSLOC.JPG";
  };

  return (
    <div className='navbarContainer'>
      <div className='navbarLeft'>
        <img
          src={logo}
          alt="Shell Logo"
          className='navbarLogo'
          onError={handleImageError}
        />
         <button className='navbarButton' onClick={Exit} >
                    KYC Home
                </button>
      </div>
      <div className='navbarTitle'>Customer KYC</div>
    </div>
  );
};

export default Navbar;
