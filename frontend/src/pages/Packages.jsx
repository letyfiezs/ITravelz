import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { packageService } from '../services/api';
import { useLanguage } from '../hooks/useContext';
import ImageSlideshow from '../components/ImageSlideshow/ImageSlideshow';
import styles from './Packages.module.css';


const Packages = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [packages,  setPackages]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [search,    setSearch]    = useState(searchParams.get('dest') || '');
  const [sort,      setSort]      = useState('');
  const [maxPrice,  setMaxPrice]  = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    packageService.getAll()
      .then((res) => {
        let data = res.data?.data || res.data?.packages || res.data || [];
        if (search)   data = data.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.destination?.toLowerCase().includes(search.toLowerCase()));
        if (maxPrice) data = data.filter(p => Number(p.price) <= Number(maxPrice));
        if (sort === 'price_asc')  data = [...data].sort((a, b) => a.price - b.price);
        if (sort === 'price_desc') data = [...data].sort((a, b) => b.price - a.price);
        if (sort === 'rating')     data = [...data].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        setPackages(data);
      })
      .catch(() => setError('Failed to load packages. Please try again.'))
      .finally(() => setLoading(false));
  }, [search, sort, maxPrice]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  return (
    <div className={styles.page}>
      {/* Hero banner */}
      <div className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={`${styles.heroContent} container`}>
          <span className="section-label">{t('section_popular')}</span>
          <h1 className={styles.heroTitle}>{t('page_packages')}</h1>
          <p className={styles.heroSub}>{t('page_packages_sub')}</p>
        </div>
      </div>

      <div className="container">
        {/* Filters */}
        <form className={styles.filters} onSubmit={handleSearch}>
          <div className={styles.filterSearch}>
            <i className="fas fa-search" />
            <input
              type="text"
              placeholder={t('filter_search_ph')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={styles.filterInput}
            />
          </div>
          <select
            className={styles.filterSelect}
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
          >
            <option value="">{t('filter_any_budget')}</option>
            <option value="500">{t('filter_under')} $500</option>
            <option value="1000">{t('filter_under')} $1,000</option>
            <option value="2000">{t('filter_under')} $2,000</option>
            <option value="5000">{t('filter_under')} $5,000</option>
          </select>
          <select
            className={styles.filterSelect}
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            {[{value:'',label:t('filter_featured')},{value:'price_asc',label:t('filter_price_low')},{value:'price_desc',label:t('filter_price_high')},{value:'rating',label:t('filter_top_rated')}].map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button type="submit" className="btn btn-primary btn-sm">
            <i className="fas fa-filter" /> {t('filter_btn')}
          </button>
        </form>

        {/* Results count */}
        {!loading && !error && (
          <p className={styles.resultCount}>
            <strong>{packages.length}</strong> {t('results_found_pkg')}
          </p>
        )}

        {/* States */}
        {loading && (
          <div className={styles.grid}>
            {[1,2,3,4,5,6].map(i => <div key={i} className={styles.skeleton} />)}
          </div>
        )}

        {error && (
          <div className="alert alert-error" style={{margin: '32px 0'}}>
            <i className="fas fa-exclamation-circle" /> {error}
            <button className="btn btn-sm btn-secondary" onClick={load} style={{marginLeft:'auto'}}>Retry</button>
          </div>
        )}

        {!loading && !error && packages.length === 0 && (
          <div className={styles.empty}>
            <i className="fas fa-search" />
            <h3>{t('no_packages')}</h3>
            <p>{t('no_packages_sub')}</p>
            <button className="btn btn-outline" onClick={() => { setSearch(''); setMaxPrice(''); setSort(''); }}>
              {t('clear_filters')}
            </button>
          </div>
        )}

        {/* Package grid */}
        {!loading && packages.length > 0 && (
          <div className={styles.grid}>
            {packages.map(pkg => (
              <div key={pkg._id} className={styles.card}>
                <div className={styles.cardImg}>
                  <ImageSlideshow
                    images={pkg.images || []}
                    fallback={pkg.image || 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=500&q=80'}
                    alt={pkg.name}
                    interval={5000}
                  />
                  {pkg.duration && (
                    <span className={styles.durBadge}>
                      <i className="fas fa-clock" /> {pkg.duration}
                    </span>
                  )}
                  {pkg.featured && <span className={styles.featBadge}>{t('filter_featured')}</span>}
                </div>
                <div className={styles.cardBody}>
                  {pkg.destination && (
                    <p className={styles.dest}>
                      <i className="fas fa-map-marker-alt" /> {pkg.destination}
                    </p>
                  )}
                  <h3 className={styles.name}>{pkg.name}</h3>
                  {pkg.description && (
                    <p className={styles.desc}>{pkg.description.slice(0, 100)}{pkg.description.length > 100 ? '…' : ''}</p>
                  )}
                  <div className={styles.rating}>
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className={`fas fa-star ${i < (pkg.rating || 5) ? styles.starOn : styles.starOff}`} />
                    ))}
                    <span>({pkg.reviews || 0} reviews)</span>
                  </div>
                  <div className={styles.footer}>
                    <div className={styles.price}>
                      <span className={styles.from}>{t('from_price')}</span>
                      <span className={styles.amount}>${pkg.price}</span>
                      <span className={styles.per}>{t('per_person')}</span>
                    </div>
                    <Link to={`/booking?package=${pkg._id}`} className="btn btn-primary btn-sm">
                      {t('btn_book_now')}
                    </Link>
                  </div>
                  {pkg.includes && pkg.includes.length > 0 && (
                    <div className={styles.includes}>
                      {pkg.includes.slice(0, 3).map(item => (
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
              <i className="fas fa-headset" /> {t('btn_contact_us')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Packages;
