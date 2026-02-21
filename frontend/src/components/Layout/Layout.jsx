import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useContext';
import { useLanguage } from '../../hooks/useContext';
import Navbar from './Navbar';
import Footer from './Footer';
import styles from './Layout.module.css';

const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        {children}
      </main>
      <Footer />
    </>
  );
};

export default Layout;
