import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route, } from 'react-router-dom';
import './index.css';
import Navbar from './Navbar.tsx';
import Footer from './Footer.tsx';
import KycAndCredit from './CashandCredit.tsx';
import CreditCustomers from './Creditkyc.tsx';
import CashCustomers from './CashCustomber.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MemoryRouter initialEntries={['/']}>
      <Navbar />
      <Routes>
        <Route path="/" element={<KycAndCredit />} />
        <Route path="/credit-customers" element={<CreditCustomers />} />
        <Route path="/cash-customers" element={<CashCustomers/>} />
      </Routes>
      <Footer />
    </MemoryRouter>
  </StrictMode>
);


