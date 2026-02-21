import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useContext';
import { userService } from '../services/api';
import styles from './Profile.module.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: '', email: '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [profileStatus, setProfileStatus] = useState('idle');
  const [pwStatus, setPwStatus] = useState('idle');
  const [profileMsg, setProfileMsg] = useState('');
  const [pwMsg, setPwMsg] = useState('');

  useEffect(() => {
    if (user) setForm({ name: user.name || '', email: user.email || '' });
  }, [user]);

  const setF = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const setPw = (k) => (e) => setPwForm((p) => ({ ...p, [k]: e.target.value }));

  const handleProfile = async (e) => {
    e.preventDefault();
    setProfileStatus('loading');
    try {
      const res = await userService.updateProfile({ name: form.name });
      updateUser(res.data.user || { name: form.name });
      setProfileStatus('success');
      setProfileMsg('Profile updated successfully.');
    } catch (err) {
      setProfileStatus('error');
      setProfileMsg(err.response?.data?.message || 'Update failed.');
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) { setPwStatus('error'); setPwMsg('Passwords do not match.'); return; }
    setPwStatus('loading');
    try {
      await userService.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwStatus('success');
      setPwMsg('Password changed successfully.');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setPwStatus('error');
      setPwMsg(err.response?.data?.message || 'Failed to change password.');
    }
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <div className={styles.avatar}>{(user?.name?.[0] || 'U').toUpperCase()}</div>
          <div>
            <h1 className={styles.name}>{user?.name}</h1>
            <p className={styles.email}>{user?.email}</p>
            {user?.role === 'admin' && <span className="badge badge-primary"><i className="fas fa-shield-alt" /> Admin</span>}
          </div>
        </div>

        <div className={styles.grid}>
          {/* Profile info */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}><i className="fas fa-user" /> Profile Information</h2>
            {profileStatus === 'success' && <div className="alert alert-success"><i className="fas fa-check-circle" />{profileMsg}</div>}
            {profileStatus === 'error'   && <div className="alert alert-error"><i className="fas fa-exclamation-circle" />{profileMsg}</div>}
            <form onSubmit={handleProfile}>
              <div className="form-group">
                <label>Full Name</label>
                <input className="form-input" type="text" value={form.name} onChange={setF('name')} required />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input className="form-input" type="email" value={form.email} disabled style={{ opacity: .6 }} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={profileStatus === 'loading'}>
                {profileStatus === 'loading' ? <><span className="spinner" /> Saving...</> : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Password */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}><i className="fas fa-lock" /> Change Password</h2>
            {pwStatus === 'success' && <div className="alert alert-success"><i className="fas fa-check-circle" />{pwMsg}</div>}
            {pwStatus === 'error'   && <div className="alert alert-error"><i className="fas fa-exclamation-circle" />{pwMsg}</div>}
            <form onSubmit={handlePassword}>
              <div className="form-group">
                <label>Current Password</label>
                <input className="form-input" type="password" value={pwForm.currentPassword} onChange={setPw('currentPassword')} required />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input className="form-input" type="password" value={pwForm.newPassword} onChange={setPw('newPassword')} placeholder="Min. 6 characters" required />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input className="form-input" type="password" value={pwForm.confirm} onChange={setPw('confirm')} required />
              </div>
              <button type="submit" className="btn btn-secondary" disabled={pwStatus === 'loading'}>
                {pwStatus === 'loading' ? <><span className="spinner" /> Updating...</> : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
