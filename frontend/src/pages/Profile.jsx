import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useContext";
import { userService } from "../services/api";
import styles from "./Profile.module.css";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [profileStatus, setProfileStatus] = useState("idle");
  const [pwStatus, setPwStatus] = useState("idle");
  const [profileMsg, setProfileMsg] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user)
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
  }, [user]);

  const setF = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const setPw = (k) => (e) => setPwForm((p) => ({ ...p, [k]: e.target.value }));

  const handleAvatarFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await userService.uploadAvatar(fd);
      updateUser({ avatar: res.data.avatar });
    } catch (err) {
      alert(err.response?.data?.message || "Avatar upload failed");
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  const handleProfile = async (e) => {
    e.preventDefault();
    setProfileStatus("loading");
    try {
      const res = await userService.updateProfile({
        name: form.name,
        phone: form.phone,
      });
      updateUser(
        res.data.user ||
          res.data.data || { name: form.name, phone: form.phone },
      );
      setProfileStatus("success");
      setProfileMsg("Profile updated successfully.");
    } catch (err) {
      setProfileStatus("error");
      setProfileMsg(err.response?.data?.message || "Update failed.");
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwStatus("error");
      setPwMsg("Passwords do not match.");
      return;
    }
    setPwStatus("loading");
    try {
      await userService.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
        confirmPassword: pwForm.newPassword,
      });
      setPwStatus("success");
      setPwMsg("Password changed successfully.");
      setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      setPwStatus("error");
      setPwMsg(err.response?.data?.message || "Failed to change password.");
    }
  };

  const initials = (user?.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={styles.page}>
      <div className="container">
        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.avatarWrap}>
            {/* Clickable avatar — click to upload */}
            <button
              type="button"
              className={styles.avatarUploadBtn}
              onClick={() => fileInputRef.current?.click()}
              title="Change profile picture"
              disabled={avatarUploading}
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="avatar"
                  className={styles.avatarImg}
                />
              ) : (
                <div className={styles.avatarFallback}>{initials}</div>
              )}
              <span className={styles.avatarOverlay}>
                {avatarUploading ? (
                  <span
                    className="spinner"
                    style={{
                      width: 20,
                      height: 20,
                      borderWidth: 3,
                      borderColor: "#fff transparent #fff #fff",
                    }}
                  />
                ) : (
                  <i className="fas fa-camera" />
                )}
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: "none" }}
              onChange={handleAvatarFile}
            />
          </div>
          <div>
            <h1 className={styles.name}>{user?.name}</h1>
            <p className={styles.email}>{user?.email}</p>
            {user?.phone && (
              <p className={styles.phoneDisplay}>
                <i className="fas fa-phone" /> {user.phone}
              </p>
            )}
            {user?.role === "admin" && (
              <span className="badge badge-primary" style={{ marginTop: 6 }}>
                <i className="fas fa-shield-alt" /> Admin
              </span>
            )}
            <p className={styles.avatarHint}>
              <i className="fas fa-camera" /> Click on the photo to change
            </p>
          </div>
        </div>

        <div className={styles.grid}>
          {/* ── Profile Info ── */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <i className="fas fa-user" /> Profile Information
            </h2>
            {profileStatus === "success" && (
              <div className="alert alert-success">
                <i className="fas fa-check-circle" /> {profileMsg}
              </div>
            )}
            {profileStatus === "error" && (
              <div className="alert alert-error">
                <i className="fas fa-exclamation-circle" /> {profileMsg}
              </div>
            )}
            <form onSubmit={handleProfile}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  className="form-input"
                  type="text"
                  value={form.name}
                  onChange={setF("name")}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  className="form-input"
                  type="email"
                  value={form.email}
                  disabled
                  style={{ opacity: 0.6 }}
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  className="form-input"
                  type="tel"
                  value={form.phone}
                  onChange={setF("phone")}
                  placeholder="+976 9900 0000"
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary mt-5 "
                disabled={profileStatus === "loading"}
              >
                {profileStatus === "loading" ? (
                  <>
                    <span className="spinner" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </form>
          </div>

          {/* ── Password ── */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <i className="fas fa-lock" /> Change Password
            </h2>
            {pwStatus === "success" && (
              <div className="alert alert-success">
                <i className="fas fa-check-circle" /> {pwMsg}
              </div>
            )}
            {pwStatus === "error" && (
              <div className="alert alert-error">
                <i className="fas fa-exclamation-circle" /> {pwMsg}
              </div>
            )}
            <form onSubmit={handlePassword}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  className="form-input"
                  type="password"
                  value={pwForm.currentPassword}
                  onChange={setPw("currentPassword")}
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  className="form-input"
                  type="password"
                  value={pwForm.newPassword}
                  onChange={setPw("newPassword")}
                  placeholder="Min. 6 characters"
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  className="form-input"
                  type="password"
                  value={pwForm.confirm}
                  onChange={setPw("confirm")}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-secondary"
                disabled={pwStatus === "loading"}
              >
                {pwStatus === "loading" ? (
                  <>
                    <span className="spinner" /> Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
