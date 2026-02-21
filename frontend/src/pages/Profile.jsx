import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useContext';
import { useLanguage } from '../hooks/useContext';
import { userService } from '../services/api';
import styles from './Profile.module.css';

const Profile = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await userService.getProfile();
      setProfile(response.data);
      setFormData(response.data);
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await userService.updateProfile(formData);
      setProfile(formData);
      setEditMode(false);
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className="loading"></div>
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileSidebar}>
        <div className={styles.profileCard}>
          <i className="fas fa-user-circle"></i>
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
        </div>

        <nav className={styles.profileNav}>
          <button
            className={`${styles.navItem} ${activeTab === 'profile' ? styles.active : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <i className="fas fa-user"></i> {t('user_profile')}
          </button>
          <button
            className={`${styles.navItem} ${activeTab === 'bookings' ? styles.active : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <i className="fas fa-calendar"></i> {t('user_bookings')}
          </button>
          <button
            className={`${styles.navItem} ${activeTab === 'settings' ? styles.active : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <i className="fas fa-cog"></i> {t('user_settings')}
          </button>
        </nav>
      </div>

      <div className={styles.profileContent}>
        {activeTab === 'profile' && (
          <div className={styles.section}>
            <h2>Profile Information</h2>
            {error && <div className={styles.errorMessage}>{error}</div>}
            {success && <div className={styles.successMessage}>{success}</div>}

            {editMode ? (
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address || ''}
                    onChange={handleChange}
                  />
                </div>
                <div className={styles.formActions}>
                  <button type="submit" className={styles.submitBtn}>
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => {
                      setEditMode(false);
                      setFormData(profile);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className={styles.profileInfo}>
                <div className={styles.infoRow}>
                  <span>Name:</span>
                  <span>{profile?.name}</span>
                </div>
                <div className={styles.infoRow}>
                  <span>Email:</span>
                  <span>{profile?.email}</span>
                </div>
                <div className={styles.infoRow}>
                  <span>Phone:</span>
                  <span>{profile?.phone || 'Not provided'}</span>
                </div>
                <div className={styles.infoRow}>
                  <span>Address:</span>
                  <span>{profile?.address || 'Not provided'}</span>
                </div>
                <button className={styles.editBtn} onClick={() => setEditMode(true)}>
                  <i className="fas fa-edit"></i> Edit Profile
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className={styles.section}>
            <h2>My Bookings</h2>
            <p>Your bookings will appear here.</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className={styles.section}>
            <h2>Settings</h2>
            <div className={styles.settingGroup}>
              <label>
                <input type="checkbox" defaultChecked />
                <span>Email me updates about my bookings</span>
              </label>
            </div>
            <div className={styles.settingGroup}>
              <label>
                <input type="checkbox" defaultChecked />
                <span>Subscribe to our newsletter</span>
              </label>
            </div>
            <button className={styles.dangerBtn}>Change Password</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
