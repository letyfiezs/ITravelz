import React, { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { packageService, contentService } from "../services/api";
import { useLanguage } from "../hooks/useContext";
import ImageSlideshow from "../components/ImageSlideshow/ImageSlideshow";
import styles from "./Packages.module.css";

/* ─── Package Detail Modal ─────────────────────────────────── */
function PackageModal({ pkg, onClose, t, language }) {
  const images = pkg.images?.length ? pkg.images : pkg.image ? [pkg.image] : [];
  const tr = (key) => pkg.translations?.[language]?.[key] || pkg[key] || "";
  const features = pkg.translations?.[language]?.features || pkg.features || [];

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
        <div className={styles.pkgModalImg}>
          <ImageSlideshow
            images={images}
            fallback={pkg.image}
            alt={pkg.name}
            interval={5000}
            enableZoom
            contentType="Package"
            contentId={pkg._id}
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
          {pkg.subCategory && (
            <span
              className={`${styles.pkgModalBadge} ${styles.pkgModalSubBadge}`}
            >
              <i className="fas fa-gem" /> {pkg.subCategory}
            </span>
          )}
        </div>
        <div className={styles.pkgModalBody}>
          {(pkg.destination || pkg.dest) && (
            <p className={styles.pkgModalMeta}>
              <i className="fas fa-map-marker-alt" />{" "}
              {pkg.destination || pkg.dest}
            </p>
          )}
          <h2 className={styles.pkgModalTitle}>{tr("name")}</h2>
          <div className={styles.pkgModalPrice}>
            <strong>{pkg.price}</strong>
            <span className={styles.pkgModalPriceLabel}>{t("per_person")}</span>
          </div>
          {tr("description") && (
            <p className={styles.pkgModalDesc}>{tr("description")}</p>
          )}
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
          {pkg.highlights?.length > 0 && (
            <div className={styles.pkgModalSection}>
              <h4 className={styles.pkgModalSubtitle}>
                <i className="fas fa-star" /> Top 5 Experiences
              </h4>
              <ul className={styles.pkgModalBulletList}>
                {pkg.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          )}
          {pkg.packingList?.length > 0 && (
            <div className={styles.pkgModalSection}>
              <h4 className={styles.pkgModalSubtitle}>
                <i className="fas fa-backpack" /> Авч явах зүйлс
              </h4>
              <ul className={styles.pkgModalBulletList}>
                {pkg.packingList.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
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
          {pkg.pricingNote && (
            <p className={styles.pkgModalPricingNote}>{pkg.pricingNote}</p>
          )}
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
              {t("close") || "Хаах"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const SUB_CATEGORIES = ["Classic", "Extreme", "Special", "Luxury"];

const Packages = () => {
  const { t, language } = useLanguage();
  // Helper: return translated field or fallback to default
  const tr = (pkg, key) =>
    pkg.translations?.[language]?.[key] || pkg[key] || "";
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState(searchParams.get("dest") || "");
  const [sort, setSort] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [subCategory, setSubCategory] = useState(
    searchParams.get("type") || "",
  );
  const [heroContent, setHeroContent] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    packageService
      .getAll()
      .then((res) => {
        let data = res.data?.data || res.data?.packages || res.data || [];
        if (search)
          data = data.filter(
            (p) =>
              p.name?.toLowerCase().includes(search.toLowerCase()) ||
              p.destination?.toLowerCase().includes(search.toLowerCase()),
          );
        if (maxPrice)
          data = data.filter((p) => Number(p.price) <= Number(maxPrice));
        if (subCategory)
          data = data.filter((p) => p.subCategory === subCategory);
        if (sort === "price_asc")
          data = [...data].sort((a, b) => a.price - b.price);
        if (sort === "price_desc")
          data = [...data].sort((a, b) => b.price - a.price);
        if (sort === "rating")
          data = [...data].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        setPackages(data);
      })
      .catch(() => setError("Failed to load packages. Please try again."))
      .finally(() => setLoading(false));
  }, [search, sort, maxPrice, subCategory]);

  useEffect(() => {
    load();
  }, [load]);

  // Load hero content once on mount
  useEffect(() => {
    contentService
      .getAll({ section: "packages_hero" })
      .then((res) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const heroes = res.data?.content || res.data || [];
        const active = heroes.filter((h) => {
          if (!h.isActive) return false;
          if (!h.validFrom) return true;
          return new Date(h.validFrom) <= today;
        });
        if (active.length > 0) setHeroContent(active[0]);
      })
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  return (
    <>
      <div className={styles.page}>
        {/* Hero banner */}
        <div
          className={styles.hero}
          style={
            heroContent?.imageUrl || heroContent?.image
              ? {
                  backgroundImage: `url(${heroContent.imageUrl || heroContent.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          <div className={styles.heroOverlay} />
          <div className={`${styles.heroContent} container`}>
            <span className="section-label">
              {heroContent?.eyebrow || t("section_popular")}
            </span>
            <h1 className={styles.heroTitle}>
              {heroContent?.title || t("page_packages")}
            </h1>
            <p className={styles.heroSub}>
              {heroContent?.subtitle ||
                heroContent?.text ||
                t("page_packages_sub")}
            </p>
          </div>
        </div>

        <div className="container">
          {/* Filters */}
          <form className={styles.filters} onSubmit={handleSearch}>
            <div className={styles.filterSearch}>
              <i className="fas fa-search" />
              <input
                type="text"
                placeholder={t("filter_search_ph")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.filterInput}
              />
            </div>
            <select
              className={styles.filterSelect}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            >
              <option value="">{t("filter_any_budget")}</option>
              <option value="500">{t("filter_under")} $500</option>
              <option value="1000">{t("filter_under")} $1,000</option>
              <option value="2000">{t("filter_under")} $2,000</option>
              <option value="5000">{t("filter_under")} $5,000</option>
            </select>
            <select
              className={styles.filterSelect}
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
            >
              <option value="">{t("filter_all_types")}</option>
              {SUB_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              className={styles.filterSelect}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              {[
                { value: "", label: t("filter_featured") },
                { value: "price_asc", label: t("filter_price_low") },
                { value: "price_desc", label: t("filter_price_high") },
                { value: "rating", label: t("filter_top_rated") },
              ].map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary btn-sm">
              <i className="fas fa-filter" /> {t("filter_btn")}
            </button>
          </form>

          {/* Results count */}
          {!loading && !error && (
            <p className={styles.resultCount}>
              <strong>{packages.length}</strong> {t("results_found_pkg")}
            </p>
          )}

          {/* States */}
          {loading && (
            <div className={styles.grid}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className={styles.skeleton} />
              ))}
            </div>
          )}

          {error && (
            <div className="alert alert-error" style={{ margin: "32px 0" }}>
              <i className="fas fa-exclamation-circle" /> {error}
              <button
                className="btn btn-sm btn-secondary"
                onClick={load}
                style={{ marginLeft: "auto" }}
              >
                {t("retry")}
              </button>
            </div>
          )}

          {!loading && !error && packages.length === 0 && (
            <div className={styles.empty}>
              <i className="fas fa-search" />
              <h3>{t("no_packages")}</h3>
              <p>{t("no_packages_sub")}</p>
              <button
                className="btn btn-outline"
                onClick={() => {
                  setSearch("");
                  setMaxPrice("");
                  setSort("");
                  setSubCategory("");
                }}
              >
                {t("clear_filters")}
              </button>
            </div>
          )}

          {/* Package grid */}
          {!loading && packages.length > 0 && (
            <div className={styles.grid}>
              {packages.map((pkg) => (
                <div
                  key={pkg._id}
                  className={`${styles.card} ${styles.pkgClickable}`}
                  onClick={() => setSelectedPkg(pkg)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setSelectedPkg(pkg)}
                >
                  <div className={styles.cardImg}>
                    <ImageSlideshow
                      images={pkg.images || []}
                      fallback={
                        pkg.image ||
                        "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=500&q=80"
                      }
                      alt={pkg.name}
                      interval={5000}
                    />
                    {pkg.duration && (
                      <span className={styles.durBadge}>
                        <i className="fas fa-clock" /> {pkg.duration}
                      </span>
                    )}
                    {pkg.featured && (
                      <span className={styles.featBadge}>
                        {t("filter_featured")}
                      </span>
                    )}
                    {pkg.subCategory && (
                      <span className={styles.subCatBadge}>
                        {pkg.subCategory}
                      </span>
                    )}
                  </div>
                  <div className={styles.cardBody}>
                    {pkg.destination && (
                      <p className={styles.dest}>
                        <i className="fas fa-map-marker-alt" />{" "}
                        {tr(pkg, "destination") || pkg.destination}
                      </p>
                    )}
                    <h3 className={styles.name}>{tr(pkg, "name")}</h3>
                    {pkg.description && (
                      <p className={styles.desc}>
                        {tr(pkg, "description").slice(0, 100)}
                        {tr(pkg, "description").length > 100 ? "\u2026" : ""}
                      </p>
                    )}
                    <div className={styles.rating}>
                      {[...Array(5)].map((_, i) => (
                        <i
                          key={i}
                          className={`fas fa-star ${i < (pkg.rating || 5) ? styles.starOn : styles.starOff}`}
                        />
                      ))}
                      <span>({pkg.reviews || 0} reviews)</span>
                    </div>
                    <div className={styles.footer}>
                      <div className={styles.price}>
                        <span className={styles.from}>{t("from_price")}</span>
                        <span className={styles.amount}>{pkg.price}</span>
                        <span className={styles.per}>{t("per_person")}</span>
                      </div>
                      <Link
                        to={`/booking?package=${pkg._id}`}
                        className="btn btn-primary btn-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {t("btn_book_now")}
                      </Link>
                    </div>
                    {pkg.includes && pkg.includes.length > 0 && (
                      <div className={styles.includes}>
                        {pkg.includes.slice(0, 3).map((item) => (
                          <span key={item} className={styles.includeTag}>
                            <i className="fas fa-check" /> {item}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA when empty DB */}
          {!loading && packages.length === 0 && !error && (
            <div className={styles.ctaBanner}>
              <div>
                <h3>Can't find what you're looking for?</h3>
                <p>Contact our travel experts for a custom itinerary.</p>
              </div>
              <Link to="/contact" className="btn btn-primary">
                <i className="fas fa-headset" /> {t("btn_contact_us")}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Package Detail Modal */}
      {selectedPkg && (
        <PackageModal
          pkg={selectedPkg}
          onClose={() => setSelectedPkg(null)}
          t={t}
          language={language}
        />
      )}
    </>
  );
};

export default Packages;
