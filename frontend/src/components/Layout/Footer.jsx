import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../hooks/useContext";
import { destinationService } from "../../services/api";
import styles from "./Footer.module.css";

const EXPLORE_LINKS = [
  { to: "/", key: "footer_home" },
  { to: "/packages", key: "footer_packages" },
  { to: "/destinations", key: "footer_services" },
  { to: "/packages", key: "footer_itineraries" },
  { to: "/about-mongolia", key: "footer_about" },
  { to: "/contact", key: "nav_contact" },
];

const socials = [
  {
    icon: "fab fa-facebook-f",
    href: "https://www.facebook.com/profile.php?id=100068557103724",
    label: "Facebook",
  },
  // { icon: 'fab fa-instagram',  href: '#', label: 'Instagram' },
  // { icon: 'fab fa-twitter',    href: '#', label: 'Twitter' },
  // { icon: 'fab fa-youtube',    href: '#', label: 'YouTube' },
  // { icon: 'fab fa-tiktok',     href: '#', label: 'TikTok' },
];

export default function Footer() {
  const { t } = useLanguage();
  const [footerDests, setFooterDests] = useState([]);

  useEffect(() => {
    destinationService
      .getAll()
      .then((r) => {
        const data = r.data?.destinations || r.data?.data || r.data || [];
        setFooterDests(Array.isArray(data) ? data.slice(0, 6) : []);
      })
      .catch(() => {});
  }, []);

  return (
    <footer className={styles.footer}>
      <div className={`${styles.inner} container`}>
        {/* Brand */}
        <div className={styles.brand}>
          <Link to="/" className={styles.logo}>
            <img
              src="/logo.png"
              alt="Itravelmongolia"
              className={styles.logoImg}
            />
            <span className={styles.logoText}>
              I<em>travel</em>mongolia
            </span>
          </Link>
          <p className={styles.tagline}>{t("footer_tagline")}</p>
          <div className={styles.socials}>
            {socials.map(({ icon, href, label }) => (
              <a
                key={label}
                href={href}
                className={styles.social}
                aria-label={label}
                target="_blank"
                rel="noreferrer"
              >
                <i className={icon} />
              </a>
            ))}
          </div>
        </div>

        {/* Explore */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>{t("footer_explore")}</h4>
          <ul className={styles.colList}>
            {EXPLORE_LINKS.map(({ to, key }) => (
              <li key={to}>
                <Link to={to} className={styles.colLink}>
                  {t(key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Destinations */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>{t("nav_destinations")}</h4>
          <ul className={styles.colList}>
            {footerDests.length > 0
              ? footerDests.map((d) => (
                  <li key={d._id}>
                    <Link to="/destinations" className={styles.colLink}>
                      {d.name || d.title}
                    </Link>
                  </li>
                ))
              : [
                  "Ulaanbaatar",
                  "Gobi Desert",
                  "Khövsgöl Lake",
                  "Terelj Park",
                  "Bayan-Ölgii",
                  "Kharkhorin",
                ].map((d) => (
                  <li key={d}>
                    <Link to="/destinations" className={styles.colLink}>
                      {d}
                    </Link>
                  </li>
                ))}
          </ul>
        </div>

        {/* Contact */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>{t("footer_contact")}</h4>
          <ul className={styles.contactList}>
            <li>
              <i className="fas fa-map-marker-alt" />
              <span>
                Address: Chingeltei district, 20th khoroo, Khuvisgalchid Street,
                Sky Hotel building room 105, Ulaanbaatar city, Mongolia
              </span>
            </li>
            <li>
              <i className="fas fa-phone" />
              <a href="tel:+97677088055">(+976) 77 0880 55</a>
            </li>
            <li>
              <i className="fas fa-envelope" />
              <a href="mailto:info@itravelmongolia.com">
                info@itravelmongolia.com
              </a>
            </li>
            <li>
              <i className="fas fa-clock" />
              <span>Everyday 24/7</span>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <p>
            &copy; {new Date().getFullYear()} Itravelmongolia. {t("footer_rights")}
          </p>
          <div className={styles.legal}>
            <Link to="/contact">{t("footer_privacy")}</Link>
            <Link to="/contact">{t("footer_terms")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
