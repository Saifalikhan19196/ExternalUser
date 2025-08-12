import React from "react";
import type { CSSProperties } from "react";

const footerStyle: CSSProperties = {
  backgroundColor: '#587187',
  padding: '20px 0',
  textAlign: 'center',
  color: 'white',
  fontFamily: 'Segoe UI, sans-serif',
  fontSize: '14px',
  borderRadius: '5px',
  marginTop: '5px',
};

const Footer: React.FC = () => {
  return (
    <div style={footerStyle}>
      © Copyright <strong>JOSLOC.</strong> All Rights Reserved
    </div>
  );
};

export default Footer;
