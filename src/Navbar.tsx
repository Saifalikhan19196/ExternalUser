import React from "react";
import './Navbar.css';
import logo from "./assets/JOSLOC.png";


const Navbar: React.FC = () => {
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
       
      </div>
      <div className='navbarTitle'>Customer KYC</div>
    </div>
  );
};

export default Navbar;
