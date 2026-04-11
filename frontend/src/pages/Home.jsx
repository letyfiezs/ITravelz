import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  packageService,
  destinationService,
  festivalService,
  aboutService,
  contentService,
} from "../services/api";
import { useLanguage } from "../hooks/useContext";
import ImageSlideshow from "../components/ImageSlideshow/ImageSlideshow";
import styles from "./Home.module.css";

// const STATS = [
//   { icon: "fas fa-users", value: "15K+", key: "stat_travelers" },
//   { icon: "fas fa-map-marker-alt", value: "120+", key: "stat_destinations" },
//   { icon: "fas fa-trophy", value: "8+", key: "stat_experience" },
//   { icon: "fas fa-star", value: "4.9", key: "stat_rating" },
// ];

const FALLBACK_PKGS = [
  {
    _id: "p1",
    name: "Naadam Festival Tour",
    destination: "Ulaanbaatar",
    price: 1299,
    duration: "6 Days",
    image:
      "https://images.unsplash.com/photo-1596797043736-67b14e7e3360?w=500&q=80",
  },
  {
    _id: "p2",
    name: "Gobi Desert Expedition",
    destination: "Gobi Desert",
    price: 1599,
    duration: "8 Days",
    image:
      "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=500&q=80",
  },
  {
    _id: "p3",
    name: "Eagle Festival Journey",
    destination: "Bayan-Ölgii",
    price: 1899,
    duration: "7 Days",
    image:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80",
  },
  {
    _id: "p4",
    name: "Khövsgöl Lake Retreat",
    destination: "Khövsgöl",
    price: 1099,
    duration: "5 Days",
    image:
      "https://images.unsplash.com/photo-1531804055935-76f44d7caff8?w=500&q=80",
  },
];

const FALLBACK_DESTS = [
  {
    _id: "d1",
    name: "Ulaanbaatar",
    country: "Mongolia",
    category: "Urban",
    image:
      "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=500&q=80",
  },
  {
    _id: "d2",
    name: "Gobi Desert",
    country: "Mongolia",
    category: "Nature",
    image:
      "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=500&q=80",
  },
  {
    _id: "d3",
    name: "Khövsgöl Lake",
    country: "Mongolia",
    category: "Nature",
    image:
      "https://images.unsplash.com/photo-1531804055935-76f44d7caff8?w=500&q=80",
  },
  {
    _id: "d4",
    name: "Terelj Park",
    country: "Mongolia",
    category: "Adventure",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&q=80",
  },
];

const FALLBACK_FESTIVALS = [
  {
    _id: "f1",
    name: "Naadam Festival",
    date: "July 11–13",
    location: "Ulaanbaatar",
    category: "naadam",
    image:
      "https://images.unsplash.com/photo-1596797043736-67b14e7e3360?w=500&q=80",
  },
  {
    _id: "f2",
    name: "Tsagaan Sar",
    date: "Jan / Feb",
    location: "Nationwide",
    category: "culture",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&q=80",
  },
  {
    _id: "f3",
    name: "Eagle Festival",
    date: "October",
    location: "Bayan-Ölgii",
    category: "culture",
    image:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80",
  },
  {
    _id: "f4",
    name: "Ice Festival",
    date: "March",
    location: "Khövsgöl",
    category: "winter",
    image:
      "https://images.unsplash.com/photo-1547369093-8a7e27cf5fd6?w=500&q=80",
  },
];

const FALLBACK_ABOUT = [
  {
    _id: "a1",
    title: "Nomadic Life",
    category: "nomad",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&q=80",
    description:
      "Nearly a third of Mongolians still live as nomads, herding livestock across vast steppes.",
  },
  {
    _id: "a2",
    title: "The Gobi Desert",
    category: "nature",
    image:
      "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=500&q=80",
    description:
      "A land of dramatic sand dunes, dinosaur fossils, and rare snow leopards.",
  },
  {
    _id: "a3",
    title: "Genghis Khan Legacy",
    category: "history",
    image:
      "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=500&q=80",
    description:
      "Birthplace of the founder of the largest contiguous land empire in history.",
  },
  {
    _id: "a4",
    title: "Throat Singing",
    category: "culture",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&q=80",
    description:
      "Khoomei — a unique UNESCO-recognised vocal art where singers produce multiple pitches.",
  },
];

/* ─── Package Detail Modal ───────────────────────────────────── */
function PackageModal({ pkg, onClose, t, language }) {
  const images = pkg.images?.length ? pkg.images : pkg.image ? [pkg.image] : [];
  const tr = (key) => pkg.translations?.[language]?.[key] || pkg[key] || "";
  const features = pkg.translations?.[language]?.features || pkg.features || [];

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", h);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className={styles.pkgModalBackdrop} onClick={handleBackdrop}>
      <div className={styles.pkgModal}>
        <button
          className={styles.pkgModalClose}
          onClick={onClose}
          aria-label="Close"
        >
          <i className="fas fa-times" />
        </button>

        {/* Image */}
        <div className={styles.pkgModalImg}>
          <ImageSlideshow
            images={images}
            fallback={pkg.image || FALLBACK_PKGS[0].image}
            alt={pkg.name}
            interval={5000}
          />
          {(pkg.duration || pkg.dur) && (
            <span className={styles.pkgModalBadge}>
              <i className="fas fa-clock" /> {pkg.duration || pkg.dur}
            </span>
          )}
          {pkg.category && (
            <span
              className={`${styles.pkgModalBadge} ${styles.pkgModalCatBadge}`}
            >
              {pkg.category}
            </span>
          )}
        </div>

        {/* Body */}
        <div className={styles.pkgModalBody}>
          {(pkg.destination || pkg.dest) && (
            <p className={styles.pkgModalMeta}>
              <i className="fas fa-map-marker-alt" />{" "}
              {pkg.destination || pkg.dest}
            </p>
          )}
          <h2 className={styles.pkgModalTitle}>{tr("name")}</h2>

          {/* Price */}
          <div className={styles.pkgModalPrice}>
            <strong>{pkg.price}</strong>
            <span className={styles.pkgModalPriceLabel}>{t("per_person")}</span>
          </div>

          {/* Description */}
          {tr("description") && (
            <p className={styles.pkgModalDesc}>{tr("description")}</p>
          )}

          {/* Features */}
          {features.length > 0 && (
            <div className={styles.pkgModalFeatures}>
              <h4 className={styles.pkgModalSubtitle}>
                <i className="fas fa-check-circle" />{" "}
                {t("pkg_features") || "Онцлог"}
              </h4>
              <ul className={styles.pkgModalFeatureList}>
                {features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Itinerary */}
          {pkg.itinerary?.length > 0 && (
            <div className={styles.pkgModalItinerary}>
              <h4 className={styles.pkgModalSubtitle}>
                <i className="fas fa-route" />{" "}
                {t("pkg_itinerary") || "Хөтөлбөр"}
              </h4>
              {pkg.itinerary.map((day, i) => (
                <div key={i} className={styles.pkgModalDay}>
                  <span className={styles.pkgModalDayNum}>
                    {t("pkg_day") || "Өдөр"} {day.day || i + 1}
                  </span>
                  <div>
                    {day.title && <strong>{day.title}</strong>}
                    {day.description && <p>{day.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Highlights */}
          {pkg.highlights?.length > 0 && (
            <div className={styles.pkgModalSection}>
              <h4 className={styles.pkgModalSubtitle}>
                <i className="fas fa-star" /> {"Top 5 Experiences"}
              </h4>
              <ul className={styles.pkgModalBulletList}>
                {pkg.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Packing List */}
          {pkg.packingList?.length > 0 && (
            <div className={styles.pkgModalSection}>
              <h4 className={styles.pkgModalSubtitle}>
                <i className="fas fa-backpack" /> {"Авч явах зүйлс"}
              </h4>
              <ul className={styles.pkgModalBulletList}>
                {pkg.packingList.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Trip Info */}
          {(pkg.totalDistance ||
            pkg.maxElevation ||
            pkg.physicalLevel ||
            pkg.bestSeason) && (
            <div className={styles.pkgModalTripInfo}>
              {pkg.totalDistance && (
                <div className={styles.pkgModalTripItem}>
                  <span className={styles.pkgModalTripLabel}>
                    Total Distance
                  </span>
                  <span className={styles.pkgModalTripValue}>
                    {pkg.totalDistance}
                  </span>
                </div>
              )}
              {pkg.maxElevation && (
                <div className={styles.pkgModalTripItem}>
                  <span className={styles.pkgModalTripLabel}>
                    Max Elevation
                  </span>
                  <span className={styles.pkgModalTripValue}>
                    {pkg.maxElevation}
                  </span>
                </div>
              )}
              {pkg.physicalLevel && (
                <div className={styles.pkgModalTripItem}>
                  <span className={styles.pkgModalTripLabel}>
                    Physical Level
                  </span>
                  <span className={styles.pkgModalTripValue}>
                    {pkg.physicalLevel}
                  </span>
                </div>
              )}
              {pkg.bestSeason && (
                <div className={styles.pkgModalTripItem}>
                  <span className={styles.pkgModalTripLabel}>Best Season</span>
                  <span className={styles.pkgModalTripValue}>
                    {pkg.bestSeason}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Pricing Note */}
          {pkg.pricingNote && (
            <p className={styles.pkgModalPricingNote}>{pkg.pricingNote}</p>
          )}

          {/* Group Pricing */}
          {pkg.groupPricing?.length > 0 && (
            <div className={styles.pkgModalGroupPricing}>
              {pkg.groupPricing.map((gp, i) => (
                <div key={i} className={styles.pkgModalGroupRow}>
                  <span className={styles.pkgModalGroupLabel}>{gp.label}</span>
                  <span className={styles.pkgModalGroupPrice}>{gp.price}$</span>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className={styles.pkgModalFooter}>
            <Link
              to={`/booking?package=${pkg._id}`}
              className="btn btn-primary"
              onClick={onClose}
            >
              <i className="fas fa-calendar-check" /> {t("btn_book_now")}
            </Link>
            <button
              className={`btn btn-outline ${styles.pkgModalCloseBtn}`}
              onClick={onClose}
            >
              {t("btn_close") || "Хаах"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Scroll Row helper ─────────────────────────────────────── */
function ScrollRow({ children, label, viewAllTo, t }) {
  const trackRef = useRef(null);
  const scroll = (dir) => {
    const el = trackRef.current;
    if (el) el.scrollBy({ left: dir * 320, behavior: "smooth" });
  };
  return (
    <div className={styles.scrollSection}>
      <div className={`${styles.sectionHead} container`}>
        <h2 className={styles.sectionTitle}>{label}</h2>
        {viewAllTo && (
          <Link
            to={viewAllTo}
            className={`btn btn-outline btn-sm ${styles.viewAllBtn}`}
          >
            {t("btn_view_all")} <i className="fas fa-arrow-right" />
          </Link>
        )}
      </div>
      <div className={styles.scrollRow}>
        <button
          className={`${styles.scrollArrow} ${styles.scrollArrowLeft}`}
          onClick={() => scroll(-1)}
          aria-label="Previous"
        >
          <i className="fas fa-chevron-left" />
        </button>
        <div className={styles.scrollTrack} ref={trackRef}>
          {children}
        </div>
        <button
          className={`${styles.scrollArrow} ${styles.scrollArrowRight}`}
          onClick={() => scroll(1)}
          aria-label="Next"
        >
          <i className="fas fa-chevron-right" />
        </button>
      </div>
    </div>
  );
}

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

/* ─── About Mongolia Detail Modal ──────────────────────────── */
function AboutModal({ item, onClose, t, language }) {
  const tr = (key) => item.translations?.[language]?.[key] || item[key] || "";
  const images =
    item.images && item.images.length > 0
      ? item.images
      : item.image
        ? [item.image]
        : [];

  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", h);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className={styles.pkgModalBackdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.pkgModal}>
        <button
          className={styles.pkgModalClose}
          onClick={onClose}
          aria-label="Close"
        >
          <i className="fas fa-times" />
        </button>
        {images.length > 0 && (
          <div className={styles.pkgModalImg}>
            <ImageSlideshow
              images={images}
              fallback={item.image}
              alt={tr("title")}
              interval={5000}
            />
            {item.category && (
              <span
                className={`${styles.pkgModalBadge} ${styles.pkgModalCatBadge}`}
              >
                {item.category}
              </span>
            )}
          </div>
        )}
        <div className={styles.pkgModalBody}>
          <h2 className={styles.pkgModalTitle}>{tr("title")}</h2>
          {tr("description") && (
            <p className={styles.pkgModalDesc}>{tr("description")}</p>
          )}
          {tr("readMore") && (
            <div className={styles.pkgModalSection}>
              <h4 className={styles.pkgModalSubtitle}>
                <i className="fas fa-book-open" /> More
              </h4>
              <p className={styles.pkgModalDesc}>{tr("readMore")}</p>
            </div>
          )}
          <div className={styles.pkgModalFooter}>
            <button
              className={`btn btn-outline ${styles.pkgModalCloseBtn}`}
              onClick={onClose}
            >
              {t("btn_close") || "Close"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Destination Detail Modal ─────────────────────────────── */
function DestModal({ dest, onClose, t, language }) {
  const tr = (key) => dest.translations?.[language]?.[key] || dest[key] || "";
  const images =
    dest.images && dest.images.length > 0
      ? dest.images
      : dest.image
        ? [dest.image]
        : [];

  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", h);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className={styles.pkgModalBackdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.pkgModal}>
        <button
          className={styles.pkgModalClose}
          onClick={onClose}
          aria-label="Close"
        >
          <i className="fas fa-times" />
        </button>
        {images.length > 0 && (
          <div className={styles.pkgModalImg}>
            <ImageSlideshow
              images={images}
              fallback={dest.image}
              alt={tr("name")}
              interval={5000}
            />
            {dest.category && (
              <span
                className={`${styles.pkgModalBadge} ${styles.pkgModalCatBadge}`}
              >
                {dest.category}
              </span>
            )}
          </div>
        )}
        <div className={styles.pkgModalBody}>
          <h2 className={styles.pkgModalTitle}>{tr("name")}</h2>
          {(dest.city || dest.country) && (
            <p className={styles.pkgModalMeta}>
              <i className="fas fa-map-marker-alt" />{" "}
              {[dest.city, dest.country].filter(Boolean).join(", ")}
            </p>
          )}
          {dest.tagline && (
            <p className={styles.pkgModalDesc}>
              <em>{tr("tagline")}</em>
            </p>
          )}
          {tr("description") && (
            <p className={styles.pkgModalDesc}>{tr("description")}</p>
          )}
          {tr("culturalInfo") && (
            <div className={styles.pkgModalSection}>
              <h4 className={styles.pkgModalSubtitle}>
                <i className="fas fa-landmark" /> Cultural &amp; Historical Info
              </h4>
              <p className={styles.pkgModalDesc}>{tr("culturalInfo")}</p>
            </div>
          )}
          {tr("readMore") && (
            <div className={styles.pkgModalSection}>
              <h4 className={styles.pkgModalSubtitle}>
                <i className="fas fa-book-open" /> Details
              </h4>
              <p className={styles.pkgModalDesc}>{tr("readMore")}</p>
            </div>
          )}
          {(dest.highlights || []).length > 0 && (
            <div className={styles.pkgModalSection}>
              <h4 className={styles.pkgModalSubtitle}>
                <i className="fas fa-star" /> Highlights
              </h4>
              <ul className={styles.pkgModalBulletList}>
                {dest.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          )}
          {(dest.bestTime || dest.avgCost) && (
            <div className={styles.pkgModalTripInfo}>
              {dest.bestTime && (
                <div className={styles.pkgModalTripItem}>
                  <span className={styles.pkgModalTripLabel}>
                    Best Time to Visit
                  </span>
                  <span className={styles.pkgModalTripValue}>
                    {dest.bestTime}
                  </span>
                </div>
              )}
              {dest.avgCost && (
                <div className={styles.pkgModalTripItem}>
                  <span className={styles.pkgModalTripLabel}>Average Cost</span>
                  <span className={styles.pkgModalTripValue}>
                    {dest.avgCost}
                  </span>
                </div>
              )}
            </div>
          )}
          <div className={styles.pkgModalFooter}>
            <button
              className={`btn btn-outline ${styles.pkgModalCloseBtn}`}
              onClick={onClose}
            >
              {t("btn_close") || "Close"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Festival Detail Modal ─────────────────────────────────── */
function FestModal({ fest, onClose, t, language }) {
  const tr = (key) => fest.translations?.[language]?.[key] || fest[key] || "";
  const images = fest.images?.length
    ? fest.images
    : fest.image
      ? [fest.image]
      : [];

  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", h);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className={styles.pkgModalBackdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.pkgModal}>
        <button
          className={styles.pkgModalClose}
          onClick={onClose}
          aria-label="Close"
        >
          <i className="fas fa-times" />
        </button>
        {images.length > 0 && (
          <div className={styles.pkgModalImg}>
            <ImageSlideshow
              images={images}
              fallback={fest.image}
              alt={tr("name")}
              interval={5000}
            />
            {fest.category && (
              <span
                className={`${styles.pkgModalBadge} ${styles.pkgModalCatBadge}`}
              >
                {fest.category}
              </span>
            )}
          </div>
        )}
        <div className={styles.pkgModalBody}>
          <h2 className={styles.pkgModalTitle}>{tr("name")}</h2>
          <div className={styles.pkgModalPrice}>
            {fest.date && (
              <span className={styles.pkgModalPriceLabel}>
                <i className="fas fa-calendar-alt" /> {fest.date}
              </span>
            )}
            {fest.location && (
              <span className={styles.pkgModalPriceLabel}>
                &bull; <i className="fas fa-map-marker-alt" /> {fest.location}
              </span>
            )}
          </div>
          {tr("description") && (
            <p className={styles.pkgModalDesc}>{tr("description")}</p>
          )}
          <div className={styles.pkgModalFooter}>
            {fest.link && (
              <a
                href={fest.link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                <i className="fas fa-external-link-alt" /> {t("btn_learn_more")}
              </a>
            )}
            <button
              className={`btn btn-outline ${styles.pkgModalCloseBtn}`}
              onClick={onClose}
            >
              {t("btn_close") || "Close"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────── */
export default function Home() {
  const { t, language } = useLanguage();
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [selectedDest, setSelectedDest] = useState(null);
  const [selectedFest, setSelectedFest] = useState(null);
  const [selectedAbout, setSelectedAbout] = useState(null);

  const [heroSlogan, setHeroSlogan] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [heroIntro, setHeroIntro] = useState("");
  const [heroVideo, setHeroVideo] = useState("");
  const [heroFrontType, setHeroFrontType] = useState("image");
  const [heroFrontText, setHeroFrontText] = useState("");
  const [heroFrontImage, setHeroFrontImage] = useState("");
  const [heroFrontOverlayText, setHeroFrontOverlayText] = useState("");
  const [heroFrontVideo, setHeroFrontVideo] = useState("");

  const [packages, setPackages] = useState(shuffle(FALLBACK_PKGS));
  const [dests, setDests] = useState(shuffle(FALLBACK_DESTS));
  const [festivals, setFestivals] = useState(shuffle(FALLBACK_FESTIVALS));
  const [abouts, setAbouts] = useState(shuffle(FALLBACK_ABOUT));

  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    // Hero content
    contentService
      .getAll({ section: "hero" })
      .then((r) => {
        const items = r.data?.data || r.data?.content || r.data || [];
        const find = (key) => items.find((c) => c.key === key);
        if (find("home_slogan"))
          setHeroSlogan(
            find("home_slogan").text || find("home_slogan").title || "",
          );
        if (find("home_image"))
          setHeroImage(
            find("home_image").image || find("home_image").imageUrl || "",
          );
        if (find("home_video")) setHeroVideo(find("home_video").text || "");
        if (find("home_intro")) setHeroIntro(find("home_intro").text || "");
        if (find("home_front_type"))
          setHeroFrontType(find("home_front_type").text || "image");
        if (find("home_front_text"))
          setHeroFrontText(find("home_front_text").text || "");
        if (find("home_front_image"))
          setHeroFrontImage(
            find("home_front_image").image ||
              find("home_front_image").imageUrl ||
              "",
          );
        if (find("home_front_overlay_text"))
          setHeroFrontOverlayText(find("home_front_overlay_text").text || "");
        if (find("home_front_video"))
          setHeroFrontVideo(
            find("home_front_video").text ||
              find("home_front_video").image ||
              "",
          );
      })
      .catch(() => {});

    packageService
      .getAll()
      .then((r) => {
        const d = r.data?.data || r.data?.packages || r.data || [];
        setPackages(
          shuffle(Array.isArray(d) && d.length > 0 ? d : FALLBACK_PKGS).slice(
            0,
            8,
          ),
        );
      })
      .catch(() => {});

    destinationService
      .getAll()
      .then((r) => {
        const d = r.data?.destinations || r.data?.data || r.data || [];
        setDests(
          shuffle(Array.isArray(d) && d.length > 0 ? d : FALLBACK_DESTS).slice(
            0,
            8,
          ),
        );
      })
      .catch(() => {});

    festivalService
      .getAll()
      .then((r) => {
        const d = r.data?.data || r.data?.festivals || r.data || [];
        setFestivals(
          shuffle(
            Array.isArray(d) && d.length > 0 ? d : FALLBACK_FESTIVALS,
          ).slice(0, 8),
        );
      })
      .catch(() => {});

    aboutService
      .getAll()
      .then((r) => {
        const d =
          r.data?.items || r.data?.data || r.data?.about || r.data || [];
        setAbouts(
          shuffle(Array.isArray(d) && d.length > 0 ? d : FALLBACK_ABOUT).slice(
            0,
            8,
          ),
        );
      })
      .catch(() => {});
  }, []);

  const slogan =
    t("home_slogan") || heroSlogan || "Discover Mongolia, Explore the World";
  const intro =
    t("home_intro") ||
    heroIntro ||
    "The land of ancient nomads — a place that stays forever in the hearts of travellers.";
  const bgImg =
    heroImage ||
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=90";

  const handleSubscribe = (e) => {
    e.preventDefault();
    setSubscribed(true);
    setEmail("");
  };

  return (
    <main className={styles.main}>
      {/* ── SECTION 1: HERO ─────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div
          className={styles.heroBg}
          style={{ backgroundImage: `url("${bgImg}")` }}
        />

        <div className={`${styles.heroContent} container`}>
          {/* Slogan at top — 2× font size */}
          <h1 className={styles.heroSlogan}>{slogan}</h1>

          {/* Media in the middle */}
          <div className={styles.heroMedia}>
            {heroVideo ? (
              <video
                src={heroVideo}
                className={styles.heroMediaEl}
                autoPlay
                muted
                loop
                playsInline
              />
            ) : heroFrontType === "video" && heroFrontVideo ? (
              <video
                src={heroFrontVideo}
                className={styles.heroMediaEl}
                autoPlay
                muted
                loop
                playsInline
              />
            ) : heroFrontType === "text" && heroFrontText ? (
              <div className={styles.heroMediaText}>
                <p>{heroFrontText}</p>
              </div>
            ) : (
              <div className={styles.heroMediaImgWrap}>
                <img
                  src={heroFrontImage || bgImg}
                  alt={slogan}
                  className={styles.heroMediaEl}
                />
                {heroFrontOverlayText && (
                  <div className={styles.heroMediaOverlay}>
                    <p>{heroFrontOverlayText}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Intro text below media */}
          <p className={styles.heroIntro}>{intro}</p>

          <div className={styles.heroCta}>
            <Link to="/packages" className="btn btn-primary btn-lg">
              <i className="fas fa-compass" /> {t("btn_explore")}
            </Link>
            <Link to="/contact" className="btn btn-outline-light btn-lg">
              <i className="fas fa-headset" /> {t("btn_contact_us")}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      {/* <section className={styles.statsSection}>
        <div className={`${styles.statsCard} container`}>
          {STATS.map(({ icon, value, key }) => (
            <div key={key} className={styles.statItem}>
              <div className={styles.statIcon}>
                <i className={icon} />
              </div>
              <div>
                <span className={styles.statValue}>{value}</span>
                <span className={styles.statLabel}>{t(key)}</span>
              </div>
            </div>
          ))}
        </div>
      </section> */}

      {/* ── SECTION 2: TOURS ─────────────────────────────────── */}
      <ScrollRow
        label={t("section_packages") || "Featured Tours"}
        viewAllTo="/packages"
        t={t}
      >
        {packages.map((pkg) => (
          <div
            key={pkg._id}
            className={`${styles.scrollCard} ${styles.pkgClickable}`}
            onClick={() => setSelectedPkg(pkg)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setSelectedPkg(pkg)}
          >
            <div className={styles.scrollCardImg}>
              <ImageSlideshow
                images={pkg.images?.length ? pkg.images : []}
                fallback={pkg.image || FALLBACK_PKGS[0].image}
                alt={pkg.name}
                interval={5000}
              />
              {(pkg.duration || pkg.dur) && (
                <span className={styles.scrollCardBadge}>
                  <i className="fas fa-clock" /> {pkg.duration || pkg.dur}
                </span>
              )}
            </div>
            <div className={styles.scrollCardBody}>
              {(pkg.destination || pkg.dest) && (
                <p className={styles.scrollCardMeta}>
                  <i className="fas fa-map-marker-alt" />{" "}
                  {pkg.destination || pkg.dest}
                </p>
              )}
              <h3 className={styles.scrollCardTitle}>{pkg.name}</h3>
              <div className={styles.scrollCardFooter}>
                <span className={styles.scrollCardPrice}>
                  {t("from_price")} <strong>${pkg.price}</strong>
                </span>
                <Link
                  to={`/booking?package=${pkg._id}`}
                  className="btn btn-primary btn-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t("btn_book_now")}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </ScrollRow>

      {/* ── SECTION 3: DESTINATIONS ──────────────────────────── */}
      <ScrollRow
        label={t("section_dest_title") || "Top Destinations"}
        viewAllTo="/destinations"
        t={t}
      >
        {dests.map((dest) => {
          const name = dest.name || dest.title || "";
          const country =
            [dest.city, dest.country].filter(Boolean).join(", ") ||
            dest.country ||
            "";
          const img = dest.image || dest.img || FALLBACK_DESTS[0].image;
          const tag = dest.category || dest.tag || "";
          return (
            <div
              key={dest._id}
              className={`${styles.scrollCard} ${styles.destScrollCard} ${styles.pkgClickable}`}
              onClick={() => setSelectedDest(dest)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setSelectedDest(dest)}
            >
              <div className={`${styles.scrollCardImg} ${styles.destImgWrap}`}>
                <ImageSlideshow
                  images={dest.images?.length ? dest.images : []}
                  fallback={img}
                  alt={name}
                  interval={5000}
                />
                <div className={styles.destOverlay} />
                {tag && <span className={styles.destTagBadge}>{tag}</span>}
                <div className={styles.destInfo}>
                  <h3 className={styles.destName}>{name}</h3>
                  {country && (
                    <p className={styles.destCountry}>
                      <i className="fas fa-map-marker-alt" /> {country}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </ScrollRow>

      {/* ── SECTION 4: FESTIVALS ─────────────────────────────── */}
      <ScrollRow
        label={t("section_festivals") || "Festivals & Celebrations"}
        viewAllTo="/festivals"
        t={t}
      >
        {festivals.map((fest) => (
          <div key={fest._id} className={styles.scrollCard}>
            <div className={styles.scrollCardImg}>
              <ImageSlideshow
                images={fest.images?.length ? fest.images : []}
                fallback={fest.image || FALLBACK_FESTIVALS[0].image}
                alt={fest.name}
                interval={5000}
              />
              {fest.category && (
                <span className={styles.scrollCardBadge}>{fest.category}</span>
              )}
            </div>
            <div className={styles.scrollCardBody}>
              <p className={styles.scrollCardMeta}>
                {fest.date && (
                  <>
                    <i className="fas fa-calendar-alt" /> {fest.date}
                  </>
                )}
                {fest.location && (
                  <>
                    {" "}
                    &bull; <i className="fas fa-map-marker-alt" />{" "}
                    {fest.location}
                  </>
                )}
              </p>
              <h3 className={styles.scrollCardTitle}>{fest.name}</h3>
              <div className={styles.scrollCardFooter}>
                <button
                  className={`btn btn-outline btn-sm ${styles.learnMoreBtn}`}
                  onClick={() => setSelectedFest(fest)}
                >
                  {t("btn_learn_more")}
                </button>
              </div>
            </div>
          </div>
        ))}
      </ScrollRow>

      {/* ── SECTION 5: ABOUT MONGOLIA ────────────────────────── */}
      <ScrollRow
        label={t("section_about_mongolia") || "Discover Mongolia"}
        viewAllTo="/about-mongolia"
        t={t}
      >
        {abouts.map((item) => (
          <div
            key={item._id}
            className={`${styles.scrollCard} ${styles.destScrollCard} ${styles.pkgClickable}`}
            onClick={() => setSelectedAbout(item)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setSelectedAbout(item)}
          >
            <div className={`${styles.scrollCardImg} ${styles.destImgWrap}`}>
              <ImageSlideshow
                images={item.images?.length ? item.images : []}
                fallback={item.image || FALLBACK_ABOUT[0].image}
                alt={item.title}
                interval={5000}
              />
              <div className={styles.destOverlay} />
              {item.category && (
                <span className={styles.destTagBadge}>{item.category}</span>
              )}
              <div className={styles.destInfo}>
                <h3 className={styles.destName}>{item.title}</h3>
                {item.description && (
                  <p className={styles.destCountry}>
                    {item.description.slice(0, 80)}
                    {item.description.length > 80 ? "…" : ""}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </ScrollRow>

      {/* Newsletter */}
      <section className={styles.newsletter}>
        <div className={styles.nlOverlay} />
        <div className={`${styles.nlContent} container`}>
          <span className="section-label">{t("section_newsletter")}</span>
          <h2 className={styles.nlTitle}>{t("section_newsletter")}</h2>
          <p className={styles.nlSub}>{t("section_newsletter_sub")}</p>
          {subscribed ? (
            <div className={styles.subSuccess}>
              <i className="fas fa-check-circle" /> {t("newsletter_success")}
            </div>
          ) : (
            <form className={styles.subForm} onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder={t("newsletter_ph")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.subInput}
              />
              <button
                type="submit"
                className={`btn btn-primary ${styles.subBtn}`}
              >
                {t("newsletter_btn")} <i className="fas fa-arrow-right" />
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Package Detail Modal */}
      {selectedPkg && (
        <PackageModal
          pkg={selectedPkg}
          onClose={() => setSelectedPkg(null)}
          t={t}
          language={language}
        />
      )}

      {/* Destination Detail Modal */}
      {selectedDest && (
        <DestModal
          dest={selectedDest}
          onClose={() => setSelectedDest(null)}
          t={t}
          language={language}
        />
      )}

      {/* Festival Detail Modal */}
      {selectedFest && (
        <FestModal
          fest={selectedFest}
          onClose={() => setSelectedFest(null)}
          t={t}
          language={language}
        />
      )}

      {/* About Mongolia Detail Modal */}
      {selectedAbout && (
        <AboutModal
          item={selectedAbout}
          onClose={() => setSelectedAbout(null)}
          t={t}
          language={language}
        />
      )}
    </main>
  );
}
