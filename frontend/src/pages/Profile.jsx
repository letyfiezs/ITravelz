import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useContext';
import { useTheme } from '../hooks/useContext';
import { userService } from '../services/api';
import styles from './Profile.module.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [form, setForm] = useState({ name: '', email: '', phone: '', avatar: '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [profileStatus, setProfileStatus] = useState('idle');
  const [pwStatus, setPwStatus] = useState('idle');
  const [profileMsg, setProfileMsg] = useState('');
  const [pwMsg, setPwMsg] = useState('');

  useEffect(() => {
    if (user) setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '', avatar: user.avatar || '' });
  }, [user]);

  const setF = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const setPw = (k) => (e) => setPwForm((p) => ({ ...p, [k]: e.target.value }));

  const handleProfile = async (e) => {
    e.preventDefault();
    setProfileStatus('loading');
    try {
      const res = await userService.updateProfile({ name: form.name, phone: form.phone, avatar: form.avatar });
      updateUser(res.data.user || res.data.data || { name: form.name, phone: form.phone, avatar: form.avatar });
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

  const initials = (user?.name || 'U').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className={styles.page}>
      <div className="container">

        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.avatarWrap}>
            {form.avatar ? (
              <img src={form.avatar} alt="avatar" className={styles.avatarImg} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
            ) : null}
            <div className={styles.avatarFallback} style={{ display: form.avatar ? 'none' : 'flex' }}>{initials}</div>
          </div>
          <div>
            <h1 className={styles.name}>{user?.name}</h1>
            <p className={styles.email}>{user?.email}</p>
            {user?.phone && <p className={styles.phoneDisplay}><i className="fas fa-phone" /> {user.phone}</p>}
            {user?.role === 'admin' && <span className="badge badge-primary" style={{ marginTop: 6 }}><i className="fas fa-shield-alt" /> Admin</span>}
          </div>
        </div>

        <div className={styles.grid}>

          {/* ── Profile Info ── */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}><i className="fas fa-user" /> Profile Information</h2>
            {profileStatus === 'success' && <div className="alert alert-success"><i className="fas fa-check-circle" /> {profileMsg}</div>}
            {profileStatus === 'error'   && <div className="alert alert-error"><i className="fas fa-exclamation-circle" /> {profileMsg}</div>}
            <form onSubmit={handleProfile}>
              <div className="form-group">
                <label>Full Name</label>
                <input className="form-input" type="text" value={form.name} onChange={setF('name')} required />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input className="form-input" type="email" value={form.email} disabled style={{ opacity: .6 }} />
              </div>
              <div className="form-group">
                <label><i className="fas fa-phone" style={{ marginRight: 6, color: 'var(--primary)' }} />Phone Number</label>
                <input className="form-input" type="tel" value={form.phone} onChange={setF('phone')} placeholder="+976 9900 0000" />
              </div>
              <div className="form-group">
                <label><i className="fas fa-image" style={{ marginRight: 6, color: 'var(--primary)' }} />Profile Picture URL</label>
                <input className="form-input" type="url" value={form.avatar} onChange={setF('avatar')} placeholder="https://example.com/photo.jpg" />
                {form.avatar && (
                  <img src={form.avatar} alt="preview" className={styles.avatarPreview} onError={(e) => e.target.style.display = 'none'} />
                )}
              </div>
              <button type="submit" className="btn btn-primary" disabled={profileStatus === 'loading'}>
                {profileStatus === 'loading' ? <><span className="spinner" /> Saving...</> : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* ── Password ── */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}><i className="fas fa-lock" /> Change Password</h2>
            {pwStatus === 'success' && <div className="alert alert-success"><i className="fas fa-check-circle" /> {pwMsg}</div>}
            {pwStatus === 'error'   && <div className="alert alert-error"><i className="fas fa-exclamation-circle" /> {pwMsg}</div>}
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

          {/* ── Settings ── */}
          <div className={styles.card} style={{ gridColumn: '1 / -1' }}>
            <h2 className={styles.cardTitle}><i className="fas fa-cog" /> Settings</h2>
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <i className={`fas ${theme === 'dark' ? 'fa-moon' : 'fa-sun'}`} style={{ color: theme === 'dark' ? '#a78bfa' : '#f59e0b', fontSize: 20 }} />
                <div>
                  <strong>Theme</strong>
                  <p>{theme === 'dark' ? 'Dark mode is on' : 'Light mode is on'}</p>
                </div>
              </div>
              <button onClick={toggleTheme} className={`${styles.toggle} ${theme === 'dark' ? styles.toggleOn : styles.toggleOff}`} type="button" aria-label="Toggle theme">
                <span className={styles.toggleKnob} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;

