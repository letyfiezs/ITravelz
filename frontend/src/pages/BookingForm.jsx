import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { bookingService, packageService } from "../services/api";
import { useAuth, useLanguage } from "../hooks/useContext";
import ImageSlideshow from "../components/ImageSlideshow/ImageSlideshow";
import styles from "./BookingForm.module.css";

const BookingForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const dateLocaleMap = {
    mn: "mn-MN",
    en: "en-US",
    de: "de-DE",
    ko: "ko-KR",
    ja: "ja-JP",
    zh: "zh-CN",
  };
  const dateLocale = dateLocaleMap[language] || "en-US";
  const tr = (pkg, key) =>
    pkg?.translations?.[language]?.[key] || pkg?.[key] || "";
  const [searchParams] = useSearchParams();
  const [packages, setPackages] = useState([]);
  const [form, setForm] = useState({
    packageId: "",
    travelDate: "",
    bookingTime: "",
    numberOfGuests: 1,
    phone: "",
    specialRequests: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null); // holds { bookingId, packageName }
  const [availability, setAvail] = useState(null); // { remainingCapacity, totalCapacity, bookedPeople }
  const [availLoading, setAvailLoading] = useState(false);

  useEffect(() => {
    packageService
      .getAll()
      .then((res) => {
        const list = (res.data.packages || res.data || []).filter(
          (p) => p.status !== "inactive" && p.status !== "archived",
        );
        setPackages(list);
        const preId = searchParams.get("package");
        if (preId) setForm((p) => ({ ...p, packageId: preId }));
      })
      .catch(() => {});
  }, []);

  // Fetch real-time availability when package + date + time are all selected
  useEffect(() => {
    const { packageId, travelDate, bookingTime } = form;
    if (!packageId || !travelDate || !bookingTime) {
      setAvail(null);
      return;
    }
    setAvailLoading(true);
    packageService
      .getAvailability(packageId, { date: travelDate, time: bookingTime })
      .then((res) => {
        setAvail(res.data);
        // If current numberOfGuests exceeds remaining capacity, clamp it
        const remaining = res.data.remainingCapacity;
        if (remaining > 0 && Number(form.numberOfGuests) > remaining) {
          setForm((p) => ({ ...p, numberOfGuests: remaining }));
        }
      })
      .catch(() => setAvail(null))
      .finally(() => setAvailLoading(false));
  }, [form.packageId, form.travelDate, form.bookingTime]);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const selectedPkg = packages.find((p) => p._id === form.packageId);
    try {
      await bookingService.create({
        customerName: user?.name || "",
        customerEmail: user?.email || "",
        customerPhone: form.phone,
        packageName: selectedPkg?.name || form.packageId,
        packageId: form.packageId,
        travelDate: form.travelDate,
        bookingTime: form.bookingTime,
        numberOfPeople: Number(form.numberOfGuests),
        specialRequests: form.specialRequests,
        userId: user?.id,
        price: selectedPkg?.price || 0,
      });
      setSuccess({
        packageName: tr(selectedPkg, "name") || selectedPkg?.name || "",
        bookingId: Date.now(),
      });
    } catch (err) {
      setError(err.response?.data?.message || t("booking_failed"));
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const selectedPkg = packages.find((p) => p._id === form.packageId);
  const hasDates = (selectedPkg?.availableDates || []).length > 0;
  const hasTimes = (selectedPkg?.availableTimes || []).length > 0;
  const totalPrice = selectedPkg
    ? selectedPkg.price * Number(form.numberOfGuests)
    : 0;
  const pkgImages = selectedPkg
    ? selectedPkg.images?.length
      ? selectedPkg.images
      : selectedPkg.image
        ? [selectedPkg.image]
        : []
    : [];

  /* ── Success screen ── */
  if (success) {
    return (
      <div className={styles.page}>
        <div className="container">
          <div className={styles.successWrap}>
            <div className={styles.successIcon}>
              <i className="fas fa-check-circle" />
            </div>
            <h2 className={styles.successTitle}>
              {t("booking_submitted_title")}
            </h2>
            <p className={styles.successSub}>
              {t("booking_submitted_for")}{" "}
              <strong>{success.packageName}</strong>{" "}
              {t("booking_submitted_received")}
              {t("booking_submitted_review")}
            </p>
            <div className={styles.successSteps}>
              <div className={styles.successStep}>
                <span className={styles.successStepNum}>1</span>
                <span>{t("booking_step_received")}</span>
              </div>
              <div className={styles.successStep}>
                <span className={styles.successStepNum}>2</span>
                <span>{t("booking_step_approved")}</span>
              </div>
              <div className={styles.successStep}>
                <span className={styles.successStepNum}>3</span>
                <span>{t("booking_step_payment")}</span>
              </div>
            </div>
            <div className={styles.successActions}>
              <Link to="/bookings" className="btn btn-primary btn-lg">
                <i className="fas fa-list" /> {t("booking_view_my_bookings")}
              </Link>
              <Link to="/packages" className="btn btn-outline btn-lg">
                <i className="fas fa-compass" />{" "}
                {t("booking_explore_more_tours")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Hero strip with selected package image */}
      {selectedPkg && pkgImages.length > 0 && (
        <div className={styles.heroStrip}>
          <ImageSlideshow
            images={pkgImages}
            fallback={selectedPkg.image}
            alt={tr(selectedPkg, "name")}
            interval={5000}
            className={styles.heroSlide}
          />
          <div className={styles.heroStripOverlay} />
          <div className={styles.heroStripContent}>
            <span className={styles.heroStripBadge}>
              {selectedPkg.category}
            </span>
            <h2 className={styles.heroStripTitle}>{tr(selectedPkg, "name")}</h2>
            {selectedPkg.destination && (
              <p className={styles.heroStripMeta}>
                <i className="fas fa-map-marker-alt" />{" "}
                {tr(selectedPkg, "destination")}
                {selectedPkg.duration && (
                  <>
                    {" "}
                    &bull; <i className="fas fa-clock" /> {selectedPkg.duration}
                  </>
                )}
              </p>
            )}
          </div>
        </div>
      )}
      <div className="container">
        <div className={styles.pageHeader}>
          <span className="section-label">{t("booking_almost_there")}</span>
          <h1 className={styles.title}>{t("booking_title")}</h1>
          <p className={styles.subtitle}>{t("booking_subtitle")}</p>
        </div>

        <div
          className={`${styles.layout} ${selectedPkg ? styles.layoutSplit : ""}`}
        >
          {/* ── LEFT: Form ── */}
          <div className={styles.formWrap}>
            {error && (
              <div className="alert alert-error">
                <i className="fas fa-exclamation-circle" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Package Select */}
              <div className="form-group">
                <label>{t("booking_tour_package")}</label>
                <div className={styles.pkgGrid}>
                  {packages.map((p) => (
                    <button
                      key={p._id}
                      type="button"
                      className={`${styles.pkgCard} ${form.packageId === p._id ? styles.pkgCardActive : ""}`}
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          packageId: p._id,
                          travelDate: "",
                          bookingTime: "",
                        }))
                      }
                    >
                      <div className={styles.pkgCardImg}>
                        <img
                          src={
                            p.image ||
                            "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=300&q=70"
                          }
                          alt={p.name}
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=300&q=70";
                          }}
                        />
                        {form.packageId === p._id && (
                          <div className={styles.pkgCardCheck}>
                            <i className="fas fa-check" />
                          </div>
                        )}
                      </div>
                      <div className={styles.pkgCardInfo}>
                        <strong>{tr(p, "name")}</strong>
                        <span>{tr(p, "destination")}</span>
                        <span className={styles.pkgPrice}>
                          ${Number(p.price).toLocaleString()}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
                {packages.length === 0 && (
                  <p
                    style={{
                      color: "var(--text-muted)",
                      textAlign: "center",
                      padding: "20px 0",
                    }}
                  >
                    <i className="fas fa-spinner fa-spin" />{" "}
                    {t("booking_loading_packages")}
                  </p>
                )}
              </div>

              {/* Date + Guests */}
              <div className={styles.row}>
                <div className="form-group">
                  <label>{t("booking_travel_date")}</label>
                  {hasDates ? (
                    <select
                      className="form-input"
                      value={form.travelDate}
                      onChange={set("travelDate")}
                      required
                    >
                      <option value="">{t("booking_select_date")}</option>
                      {selectedPkg.availableDates.map((d) => (
                        <option key={d} value={d}>
                          {new Date(d + "T00:00:00").toLocaleDateString(
                            dateLocale,
                            { month: "short", day: "numeric", year: "numeric" },
                          )}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="form-input"
                      type="date"
                      min={today}
                      value={form.travelDate}
                      onChange={set("travelDate")}
                      required
                    />
                  )}
                </div>
                <div className="form-group">
                  <label>{t("booking_guests_label")}</label>
                  <input
                    className="form-input"
                    type="number"
                    min="1"
                    max={
                      availability?.remainingCapacity ||
                      selectedPkg?.bookingLimitPerSlot ||
                      20
                    }
                    value={form.numberOfGuests}
                    onChange={set("numberOfGuests")}
                    required
                  />
                  {availLoading && (
                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                        marginTop: 4,
                      }}
                    >
                      <i
                        className="fas fa-spinner fa-spin"
                        style={{ marginRight: 4 }}
                      />{" "}
                      {t("booking_checking_availability")}
                    </p>
                  )}
                  {!availLoading && availability && (
                    <p
                      style={{
                        fontSize: 12,
                        marginTop: 4,
                        color:
                          availability.remainingCapacity === 0
                            ? "var(--error)"
                            : availability.remainingCapacity <= 3
                              ? "#f59e0b"
                              : "var(--success, #10b981)",
                        fontWeight: 600,
                      }}
                    >
                      <i
                        className={`fas ${availability.remainingCapacity === 0 ? "fa-ban" : availability.remainingCapacity <= 3 ? "fa-exclamation-triangle" : "fa-users"}`}
                        style={{ marginRight: 4 }}
                      />
                      {availability.remainingCapacity === 0
                        ? t("booking_slot_full")
                        : `${availability.remainingCapacity} ${t("booking_of")} ${availability.totalCapacity} ${t("booking_spots_available")}`}
                    </p>
                  )}
                  {!availLoading &&
                    !availability &&
                    selectedPkg?.bookingLimitPerSlot && (
                      <p
                        style={{
                          fontSize: 12,
                          color: "var(--text-muted)",
                          marginTop: 4,
                        }}
                      >
                        <i
                          className="fas fa-users"
                          style={{ color: "var(--primary)", marginRight: 4 }}
                        />
                        {t("booking_up_to")}{" "}
                        <strong>{selectedPkg.bookingLimitPerSlot}</strong>{" "}
                        {t("booking_guests_per_slot")} —{" "}
                        {t("booking_select_datetime_hint")}
                      </p>
                    )}
                </div>
              </div>

              {/* Time slot (only if package has times) */}
              {hasTimes && (
                <div className="form-group">
                  <label>
                    <i className="fas fa-clock" /> {t("booking_departure_time")}
                  </label>
                  <div className={styles.timeGrid}>
                    {selectedPkg.availableTimes.map((t) => (
                      <button
                        key={t}
                        type="button"
                        className={`${styles.timeSlot} ${form.bookingTime === t ? styles.timeSlotActive : ""}`}
                        onClick={() =>
                          setForm((p) => ({ ...p, bookingTime: t }))
                        }
                      >
                        <i className="fas fa-clock" /> {t}
                      </button>
                    ))}
                  </div>
                  {hasTimes && !form.bookingTime && (
                    <p
                      style={{
                        color: "var(--error)",
                        fontSize: 12,
                        marginTop: 4,
                      }}
                    >
                      {t("booking_select_time_slot")}
                    </p>
                  )}
                </div>
              )}

              <div className="form-group">
                <label>{t("contact_phone")}</label>
                <input
                  className="form-input"
                  type="tel"
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder="+976 9900-0000"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  {t("booking_special_requests")}{" "}
                  <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
                    ({t("booking_optional")})
                  </span>
                </label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={form.specialRequests}
                  onChange={set("specialRequests")}
                  placeholder={t("booking_special_placeholder")}
                />
              </div>

              <div className={styles.actions}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => navigate("/bookings")}
                >
                  <i className="fas fa-arrow-left" /> {t("booking_back")}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={
                    loading ||
                    !form.packageId ||
                    (hasTimes && !form.bookingTime) ||
                    availability?.remainingCapacity === 0
                  }
                >
                  {loading ? (
                    <>
                      <span className="spinner" /> {t("booking_confirming")}
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check" />{" "}
                      {t("booking_confirm_booking")}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* ── RIGHT: Package Info Card ── */}
          {selectedPkg && (
            <div className={styles.infoCard}>
              <div className={styles.infoImg}>
                <ImageSlideshow
                  images={pkgImages}
                  fallback={
                    selectedPkg.image ||
                    "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600&q=80"
                  }
                  alt={selectedPkg.name}
                  interval={5000}
                />
                <div className={styles.infoImgOverlay} />
                <span className={styles.infoCategoryBadge}>
                  {selectedPkg.category}
                </span>
              </div>
              <div className={styles.infoBody}>
                <h3 className={styles.infoTitle}>{tr(selectedPkg, "name")}</h3>
                <div className={styles.infoMeta}>
                  <span>
                    <i className="fas fa-map-marker-alt" />{" "}
                    {tr(selectedPkg, "destination")}
                  </span>
                  <span>
                    <i className="fas fa-clock" /> {selectedPkg.duration}
                  </span>
                </div>
                {(tr(selectedPkg, "description") ||
                  selectedPkg.description) && (
                  <p className={styles.infoDesc}>
                    {tr(selectedPkg, "description")}
                  </p>
                )}
                {(
                  selectedPkg.translations?.[language]?.features ||
                  selectedPkg.features ||
                  []
                ).length > 0 && (
                  <ul className={styles.infoFeatures}>
                    {(
                      selectedPkg.translations?.[language]?.features ||
                      selectedPkg.features ||
                      []
                    ).map((f, i) => (
                      <li key={i}>
                        <i className="fas fa-check-circle" /> {f}
                      </li>
                    ))}
                  </ul>
                )}
                <div className={styles.infoPriceBox}>
                  <div>
                    <span className={styles.infoPriceLabel}>
                      {t("booking_price_per_person")}
                    </span>
                    <strong className={styles.infoPriceValue}>
                      ${Number(selectedPkg.price).toLocaleString()}
                    </strong>
                  </div>
                  {Number(form.numberOfGuests) > 1 && (
                    <div className={styles.infoTotal}>
                      <span>
                        {form.numberOfGuests} {t("booking_guests_count")}
                      </span>
                      <strong>${totalPrice.toLocaleString()}</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
