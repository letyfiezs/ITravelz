import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import styles from './Layout.module.css';

const Layout = () => (
  <div className={styles.wrapper}>
    <Navbar />
    <div className={styles.main}>
      <Outlet />
    </div>
    <Footer />
  </div>
);

export default Layout;
