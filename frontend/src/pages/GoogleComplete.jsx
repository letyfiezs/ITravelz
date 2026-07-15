import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../hooks/useContext";
import api from "../services/api";
import styles from "./Auth.module.css";

/**
 * Shown only for NEW Google users.
 * URL: /google-complete?token=JWT&user=BASE64_JSON
 * Asks for phone number, then saves it and logs the user in.
 */
export default function GoogleComplete() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = params.get("token");
    const raw = params.get("user");
    if (!t || !raw) {
      navigate("/login?error=google_failed", { replace: true });
      return;
    }
    try {
      setToken(t);
      setUserData(JSON.parse(atob(raw)));
    } catch {
      navigate("/login?error=google_failed", { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.put(
        "/auth/google/complete",
        { phone },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const updatedUser = res.data.user;
      loginWithToken(token, updatedUser);
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    loginWithToken(token, userData);
    navigate("/", { replace: true });
  };

  if (!userData) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: 16,
          flexDirection: "column",
        }}
      >
        <span
          className="spinner"
          style={{ width: 36, height: 36, borderWidth: 4 }}
        />
      </div>
    );
  }

  return (
    <div className={styles.authPage}>
      {/* Left panel */}
      <div className={styles.authLeft}>
        <div className={styles.authLeftContent}>
          <Link to="/" className={styles.authBrand}>
            <span className={styles.brandIcon}>
              <i className="fas fa-paper-plane" />
            </span>
            <span className={styles.brandText}>
              I<span>travel</span>mongolia
            </span>
          </Link>
          <h2>Almost there!</h2>
          <p>
            Your Google account has been connected. Just add your phone number
            to complete your Itravelmongolia profile.
          </p>
          <ul className={styles.authFeatures}>
            <li>
              <i className="fas fa-check-circle" /> Free to join, no credit card
              needed
            </li>
            <li>
              <i className="fas fa-check-circle" /> Exclusive member-only deals
            </li>
            <li>
              <i className="fas fa-check-circle" /> Personalized travel
              recommendations
            </li>
          </ul>
        </div>
        <div className={styles.authLeftOverlay} />
      </div>

      {/* Right form */}
      <div className={styles.authRight}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            {userData.avatar && (
              <img
                src={userData.avatar}
                alt="avatar"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginBottom: 8,
                }}
              />
            )}
            <h1>Finish signing up</h1>
            <p>
              Welcome, <strong>{userData.name}</strong>! Add your phone number
              to complete registration.
            </p>
          </div>

          {error && (
            <div className="alert alert-error">
              <i className="fas fa-exclamation-circle" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.authForm}>
            <div className="form-group">
              <label>Full Name</label>
              <div className={styles.inputWrap}>
                <i className="fas fa-user" />
                <input
                  className="form-input"
                  type="text"
                  value={userData.name}
                  disabled
                  style={{ opacity: 0.7 }}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <div className={styles.inputWrap}>
                <i className="fas fa-envelope" />
                <input
                  className="form-input"
                  type="email"
                  value={userData.email}
                  disabled
                  style={{ opacity: 0.7 }}
                />
              </div>
            </div>
            <div className="form-group">
              <label>
                Phone Number{" "}
                <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
                  (optional)
                </span>
              </label>
              <div className={styles.inputWrap}>
                <i className="fas fa-phone" />
                <input
                  className="form-input"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+976 9900 0000"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              className={`btn btn-primary ${styles.submitBtn}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" /> Saving...
                </>
              ) : (
                <>
                  Complete Registration <i className="fas fa-arrow-right" />
                </>
              )}
            </button>
          </form>

          <p className={styles.switchText}>
            <button
              onClick={handleSkip}
              style={{
                background: "none",
                border: "none",
                color: "var(--primary)",
                cursor: "pointer",
                fontSize: "inherit",
                textDecoration: "underline",
              }}
            >
              Skip for now
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
