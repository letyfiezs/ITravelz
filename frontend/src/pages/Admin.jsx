import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import styles from './Admin.module.css';

const TABS             = ['overview', 'bookings', 'packages', 'itineraries', 'destinations', 'festivals', 'users'];
const BOOKING_STATUSES = ['pending', 'approved', 'completed', 'cancelled'];
const CATEGORIES       = ['Beach', 'Cultural', 'Adventure', 'City', 'Nature', 'Romantic', 'Family', 'Cruise'];
const DEST_CATEGORIES  = ['Beach', 'Cultural', 'Adventure', 'City', 'Nature', 'Romantic', 'Family', 'Historical', 'Mountain', 'Desert'];

const EMPTY_PKG  = { name: '', description: '', price: '', category: 'Beach', duration: '', destination: '', image: '', images: [], features: '', status: 'active', availableDates: [], availableTimes: [], bookingLimitPerSlot: 5 };
const EMPTY_ITIN = { title: '', description: '', duration: '', locations: '', difficulty: 'moderate', price: '', order: 0, isActive: true };
const DIFFICULTIES = ['easy', 'moderate', 'challenging'];
const EMPTY_DEST = { name: '', city: '', country: '', category: 'Cultural', image: '', images: [], location: '', tagline: '', description: '', culturalInfo: '', highlights: '', bestTime: '', avgCost: '', readMore: '', isActive: true };
const FEST_CATEGORIES = ['naadam', 'culture', 'religious', 'winter', 'food', 'music', 'other'];
const EMPTY_FEST = { name: '', description: '', date: '', location: '', image: '', images: [], category: 'culture', link: '', isActive: true };

/* ── Google Maps embed URL builder (no API key needed) ── */
const buildMapEmbedUrl = (query) => {
  if (!query || !query.trim()) return '';
  const q = query.trim();
  // Already an embed URL
  if (q.includes('/maps/embed')) return q;
  // Google Maps place URL
  if (q.includes('google.com/maps/place')) {
    const part = q.replace(/.*google\.com\/maps\/place\//, '').split('/')[0];
    return `https://maps.google.com/maps?q=${encodeURIComponent(decodeURIComponent(part))}&output=embed`;
  }
  // Any other Google Maps / goo.gl link
  if (q.includes('google.com/maps') || q.includes('maps.google') || q.includes('goo.gl/maps')) {
    return q.replace('/maps?', '/maps/embed?').replace(/\/maps\/(?!embed)/, '/maps/embed/');
  }
  // Plain text search
  return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
};

/* ─── Modal ─── */
const Modal = ({ title, onClose, children }) => (
  <div className={styles.modalBackdrop} onClick={onClose}>
    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
      <div className={styles.modalHeader}>
        <h3>{title}</h3>
        <button className={styles.modalClose} onClick={onClose}><i className="fas fa-times" /></button>
      </div>
      {children}
    </div>
  </div>
);

const Admin = () => {
  const [tab, setTab]             = useState('overview');
  const [stats, setStats]         = useState(null);
  const [bookings, setBookings]   = useState([]);
  const [users, setUsers]         = useState([]);
  const [packages, setPackages]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  /* booking filter */
  const [bFilter, setBFilter]     = useState('all');

  /* booking detail modal */
  const [bDetail, setBDetail]     = useState(null);

  /* destinations */
  const [destinations, setDestinations] = useState([]);
  const [destModal, setDestModal]       = useState(false);
  const [destForm, setDestForm]         = useState(EMPTY_DEST);
  const [destEdit, setDestEdit]         = useState(null);
  const [destSaving, setDestSaving]     = useState(false);
  const [destMsg, setDestMsg]           = useState('');
  const [destImgFiles, setDestImgFiles] = useState([]);
  const [destCurImages, setDestCurImages] = useState([]);
  /* destination map picker */
  const [destMapSearch, setDestMapSearch]   = useState('');
  const [destMapPreview, setDestMapPreview] = useState('');

  /* destinations hero (page header scheduling) */
  const EMPTY_HERO = { title: '', subtitle: '', eyebrow: '', imageUrl: '', validFrom: '', isActive: true };
  const [destHeroList, setDestHeroList]       = useState([]);
  const [destHeroModal, setDestHeroModal]     = useState(false);
  const [destHeroForm, setDestHeroForm]       = useState(EMPTY_HERO);
  const [destHeroEdit, setDestHeroEdit]       = useState(null);
  const [destHeroSaving, setDestHeroSaving]   = useState(false);
  const [destHeroMsg, setDestHeroMsg]         = useState('');
  const [destHeroBgFile, setDestHeroBgFile]   = useState(null);
  const [destHeroBgUploading, setDestHeroBgUploading] = useState(false);

  /* festivals */
  const [festivals, setFestivals]             = useState([]);
  const [festModal, setFestModal]             = useState(false);
  const [festForm, setFestForm]               = useState(EMPTY_FEST);
  const [festEdit, setFestEdit]               = useState(null);
  const [festSaving, setFestSaving]           = useState(false);
  const [festMsg, setFestMsg]                 = useState('');
  const [festImgFiles, setFestImgFiles]       = useState([]);
  const [festCurImages, setFestCurImages]     = useState([]);

  /* package modal */
  const [pkgModal, setPkgModal]         = useState(false);
  const [pkgForm, setPkgForm]           = useState(EMPTY_PKG);
  const [pkgEdit, setPkgEdit]           = useState(null);
  const [pkgSaving, setPkgSaving]       = useState(false);
  const [pkgMsg, setPkgMsg]             = useState('');
  const [pkgImgFiles, setPkgImgFiles]   = useState([]);
  const [pkgCurImages, setPkgCurImages] = useState([]);
  /* date/time inputs */
  const [newDate, setNewDate]     = useState('');
  const [newTime, setNewTime]     = useState('');

  /* itinerary modal */
  const [itineraries, setItineraries]   = useState([]);
  const [itinModal, setItinModal]       = useState(false);
  const [itinForm, setItinForm]         = useState(EMPTY_ITIN);
  const [itinEdit, setItinEdit]         = useState(null);
  const [itinSaving, setItinSaving]     = useState(false);
  const [itinMsg, setItinMsg]           = useState('');
  const [itinImgFiles, setItinImgFiles] = useState([]);
  const [itinCurImages, setItinCurImages] = useState([]);

  useEffect(() => {
    Promise.all([
      adminService.getStats(),
      adminService.getBookings(),
      adminService.getUsers(),
      adminService.getPackages(),
      adminService.getDestinations(),
      adminService.getItineraries(),
      adminService.getContent(),
      adminService.getFestivals(),
    ])
      .then(([s, b, u, pk, dest, itin, cont, fest]) => {
        setStats(s.data);
        setBookings(b.data.bookings || b.data || []);
        setUsers(u.data.users || u.data || []);
        setPackages(pk.data.packages || pk.data || []);
        setDestinations(dest.data.destinations || dest.data || []);
        setItineraries(itin.data.itineraries || itin.data || []);
        const allContent = cont.data.content || cont.data || [];
        setDestHeroList(allContent.filter((c) => c.section === 'destinations_hero'));
        setFestivals(fest.data.festivals || fest.data || []);
      })
      .catch(() => setError('Failed to load admin data. Make sure the backend is running.'))
      .finally(() => setLoading(false));
  }, []);

  /* ── Booking helpers ── */
  const updateStatus = async (id, status) => {
    try {
      await adminService.updateBookingStatus(id, status);
      setBookings((prev) => prev.map((b) => b._id === id ? { ...b, status } : b));
      if (bDetail?._id === id) setBDetail((p) => ({ ...p, status }));
    } catch { alert('Status update failed.'); }
  };
  const approveBook = async (id) => {
    try { await adminService.approveBooking(id); setBookings((p) => p.map((b) => b._id === id ? { ...b, status: 'approved' } : b)); if (bDetail?._id === id) setBDetail((p) => ({ ...p, status: 'approved' })); }
    catch { alert('Approve failed.'); }
  };
  const declineBook = async (id) => {
    try { await adminService.declineBooking(id); setBookings((p) => p.map((b) => b._id === id ? { ...b, status: 'cancelled' } : b)); if (bDetail?._id === id) setBDetail((p) => ({ ...p, status: 'cancelled' })); }
    catch { alert('Decline failed.'); }
  };
  const deleteBooking = async (id) => {
    if (!window.confirm('Delete this booking permanently?')) return;
    try { await adminService.deleteBooking(id); setBookings((p) => p.filter((b) => b._id !== id)); setBDetail(null); }
    catch { alert('Delete failed.'); }
  };
  const filteredBookings = bFilter === 'all' ? bookings : bookings.filter((b) => b.status === bFilter);

  /* ── Package helpers ── */
  const openPkgCreate = () => { setPkgEdit(null); setPkgForm(EMPTY_PKG); setPkgCurImages([]); setPkgImgFiles([]); setNewDate(''); setNewTime(''); setPkgMsg(''); setPkgModal(true); };
  const openPkgEdit   = (p) => {
    setPkgEdit(p._id);
    setPkgForm({ name: p.name, description: p.description, price: p.price, category: p.category, duration: p.duration, destination: p.destination, image: p.image || '', images: p.images || [], features: (p.features || []).join(', '), status: p.status || 'active', availableDates: p.availableDates || [], availableTimes: p.availableTimes || [], bookingLimitPerSlot: p.bookingLimitPerSlot || 5 });
    setPkgCurImages(p.images || []);
    setPkgImgFiles([]);
    setNewDate(''); setNewTime(''); setPkgMsg(''); setPkgModal(true);
  };
  const closePkg = () => { setPkgModal(false); setPkgMsg(''); setPkgImgFiles([]); setPkgCurImages([]); };
  const setP = (k) => (e) => setPkgForm((prev) => ({ ...prev, [k]: e.target.value }));

  const addDate = () => { if (newDate && !pkgForm.availableDates.includes(newDate)) { setPkgForm((p) => ({ ...p, availableDates: [...p.availableDates, newDate].sort() })); setNewDate(''); } };
  const removeDate = (d) => setPkgForm((p) => ({ ...p, availableDates: p.availableDates.filter((x) => x !== d) }));
  const addTime = () => { if (newTime && !pkgForm.availableTimes.includes(newTime)) { setPkgForm((p) => ({ ...p, availableTimes: [...p.availableTimes, newTime].sort() })); setNewTime(''); } };
  const removeTime = (t) => setPkgForm((p) => ({ ...p, availableTimes: p.availableTimes.filter((x) => x !== t) }));

  const savePkg = async (e) => {
    e.preventDefault(); setPkgSaving(true); setPkgMsg('');
    const payload = { ...pkgForm, price: parseFloat(pkgForm.price), features: pkgForm.features.split(',').map((s) => s.trim()).filter(Boolean), images: pkgCurImages };
    try {
      let savedId = pkgEdit;
      if (pkgEdit) {
        const res = await adminService.updatePackage(pkgEdit, payload);
        const updated = res.data.package || res.data;
        setPackages((prev) => prev.map((x) => x._id === pkgEdit ? updated : x));
        setPkgMsg('✅ Package updated!');
      } else {
        const res = await adminService.createPackage(payload);
        const created = res.data.package || res.data;
        savedId = created._id;
        setPackages((prev) => [created, ...prev]);
        setPkgMsg('✅ Package created!');
        setPkgForm(EMPTY_PKG);
      }
      // Upload new image files if any
      if (pkgImgFiles.length > 0 && savedId) {
        const fd = new FormData();
        pkgImgFiles.forEach((f) => fd.append('images', f));
        const upRes = await adminService.uploadPackageImages(savedId, fd);
        const updatedImages = upRes.data.images || [];
        setPackages((prev) => prev.map((x) => x._id === savedId ? { ...x, images: updatedImages } : x));
        setPkgImgFiles([]);
      }
      setTimeout(closePkg, 900);
    } catch (err) { setPkgMsg('❌ ' + (err.response?.data?.message || 'Save failed.')); }
    finally { setPkgSaving(false); }
  };
  const deletePkg = async (id) => {
    if (!window.confirm('Delete this package?')) return;
    try { await adminService.deletePackage(id); setPackages((p) => p.filter((x) => x._id !== id)); }
    catch { alert('Delete failed.'); }
  };

  /* ── Package image helpers ── */
  const removePkgCurImage = async (imgUrl) => {
    setPkgCurImages((prev) => prev.filter((x) => x !== imgUrl));
    if (pkgEdit) {
      try { await adminService.deletePackageImage(pkgEdit, imgUrl); } catch { /* ignore */ }
    }
  };
  const onPkgFileChange = (e) => {
    const files = Array.from(e.target.files);
    const total = pkgCurImages.length + pkgImgFiles.length + files.length;
    if (total > 10) { alert('Хамгийн ихдээ 10 зураг байж болно!'); return; }
    setPkgImgFiles((prev) => [...prev, ...files].slice(0, 10));
    e.target.value = '';
  };
  const removePkgNewFile = (idx) => setPkgImgFiles((prev) => prev.filter((_, i) => i !== idx));

  /* ── Itinerary helpers ── */
  const openItinCreate = () => { setItinEdit(null); setItinForm(EMPTY_ITIN); setItinCurImages([]); setItinImgFiles([]); setItinMsg(''); setItinModal(true); };
  const openItinEdit = (it) => {
    setItinEdit(it._id);
    setItinForm({ title: it.title, description: it.description, duration: it.duration || '', locations: it.locations || '', difficulty: it.difficulty || 'moderate', price: it.price || '', order: it.order || 0, isActive: it.isActive ?? true });
    setItinCurImages(it.images || []);
    setItinImgFiles([]);
    setItinMsg(''); setItinModal(true);
  };
  const closeItin = () => { setItinModal(false); setItinMsg(''); setItinImgFiles([]); setItinCurImages([]); };
  const setI = (k) => (e) => setItinForm((prev) => ({ ...prev, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const saveItin = async (e) => {
    e.preventDefault(); setItinSaving(true); setItinMsg('');
    const payload = { ...itinForm, price: itinForm.price ? parseFloat(itinForm.price) : undefined, order: parseInt(itinForm.order) || 0 };
    try {
      let savedId = itinEdit;
      if (itinEdit) {
        const res = await adminService.updateItinerary(itinEdit, payload);
        const updated = res.data.itinerary || res.data;
        setItineraries((prev) => prev.map((x) => x._id === itinEdit ? { ...updated, images: itinCurImages } : x));
        setItinMsg('✅ Itinerary updated!');
      } else {
        const res = await adminService.createItinerary(payload);
        const created = res.data.itinerary || res.data;
        savedId = created._id;
        setItineraries((prev) => [created, ...prev]);
        setItinMsg('✅ Itinerary created!');
        setItinForm(EMPTY_ITIN);
      }
      if (itinImgFiles.length > 0 && savedId) {
        const fd = new FormData();
        itinImgFiles.forEach((f) => fd.append('images', f));
        const upRes = await adminService.uploadItineraryImages(savedId, fd);
        const updatedImages = upRes.data.images || [];
        setItineraries((prev) => prev.map((x) => x._id === savedId ? { ...x, images: updatedImages } : x));
        setItinImgFiles([]);
      }
      setTimeout(closeItin, 900);
    } catch (err) { setItinMsg('❌ ' + (err.response?.data?.message || 'Save failed.')); }
    finally { setItinSaving(false); }
  };
  const deleteItin = async (id) => {
    if (!window.confirm('Delete this itinerary?')) return;
    try { await adminService.deleteItinerary(id); setItineraries((p) => p.filter((x) => x._id !== id)); }
    catch { alert('Delete failed.'); }
  };
  const removeItinCurImage = async (imgUrl) => {
    setItinCurImages((prev) => prev.filter((x) => x !== imgUrl));
    if (itinEdit) { try { await adminService.deleteItineraryImage(itinEdit, imgUrl); } catch { /* ignore */ } }
  };
  const onItinFileChange = (e) => {
    const files = Array.from(e.target.files);
    const total = itinCurImages.length + itinImgFiles.length + files.length;
    if (total > 10) { alert('Хамгийн ихдээ 10 зураг байж болно!'); return; }
    setItinImgFiles((prev) => [...prev, ...files].slice(0, 10));
    e.target.value = '';
  };
  const removeItinNewFile = (idx) => setItinImgFiles((prev) => prev.filter((_, i) => i !== idx));

  /* ── Destination helpers ── */
  const openDestCreate = () => { setDestEdit(null); setDestForm(EMPTY_DEST); setDestCurImages([]); setDestImgFiles([]); setDestMsg(''); setDestMapSearch(''); setDestMapPreview(''); setDestModal(true); };
  const openDestEdit = (d) => {
    setDestEdit(d._id);
    setDestForm({ name: d.name, city: d.city||'', country: d.country||'', category: d.category, image: d.image||'', images: d.images||[], location: d.location||'', tagline: d.tagline||'', description: d.description||'', culturalInfo: d.culturalInfo||'', highlights: (d.highlights||[]).join('\n'), bestTime: d.bestTime||'', avgCost: d.avgCost||'', readMore: d.readMore||'', isActive: d.isActive??true });
    setDestCurImages(d.images || []); setDestImgFiles([]);
    setDestMapSearch(d.location || '');
    setDestMapPreview(d.location ? buildMapEmbedUrl(d.location) : '');
    setDestMsg(''); setDestModal(true);
  };
  const closeDest = () => { setDestModal(false); setDestMsg(''); setDestImgFiles([]); setDestCurImages([]); setDestMapSearch(''); setDestMapPreview(''); };
  const setD = (k) => (e) => setDestForm((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  /* map picker helpers */
  const handleMapSearch = () => {
    const q = destMapSearch.trim();
    if (!q) return;
    setDestMapPreview(buildMapEmbedUrl(q));
  };
  const applyMapLocation = () => {
    const q = destMapSearch.trim();
    if (!q) return;
    const embedUrl = buildMapEmbedUrl(q);
    setDestMapPreview(embedUrl);
    setDestForm((p) => ({ ...p, location: embedUrl }));
  };
  const clearMapLocation = () => {
    setDestForm((p) => ({ ...p, location: '' }));
    setDestMapPreview('');
    setDestMapSearch('');
  };
  const saveDest = async (e) => {
    e.preventDefault(); setDestSaving(true); setDestMsg('');
    const payload = { ...destForm, highlights: destForm.highlights.split('\n').map((s) => s.trim()).filter(Boolean), images: destCurImages };
    try {
      let savedId = destEdit;
      if (destEdit) {
        const r = await adminService.updateDestination(destEdit, payload);
        const updated = r.data.destination || r.data;
        setDestinations((p) => p.map((x) => x._id === destEdit ? updated : x));
        setDestMsg('✅ Updated!');
      } else {
        const r = await adminService.createDestination(payload);
        const created = r.data.destination || r.data;
        savedId = created._id;
        setDestinations((p) => [created, ...p]);
        setDestMsg('✅ Created!'); setDestForm(EMPTY_DEST);
      }
      if (destImgFiles.length > 0 && savedId) {
        const fd = new FormData();
        destImgFiles.forEach((f) => fd.append('images', f));
        const upRes = await adminService.uploadDestinationImages(savedId, fd);
        const updatedImages = upRes.data.images || [];
        setDestinations((p) => p.map((x) => x._id === savedId ? { ...x, images: updatedImages } : x));
        setDestImgFiles([]);
      }
      setTimeout(closeDest, 900);
    } catch (err) { setDestMsg('❌ ' + (err.response?.data?.message || 'Save failed.')); }
    finally { setDestSaving(false); }
  };
  const deleteDest = async (id) => {
    if (!window.confirm('Delete this destination?')) return;
    try { await adminService.deleteDestination(id); setDestinations((p) => p.filter((x) => x._id !== id)); }
    catch { alert('Delete failed.'); }
  };
  /* ── Destination image helpers ── */
  const removeDestCurImage = async (imgUrl) => {
    setDestCurImages((prev) => prev.filter((x) => x !== imgUrl));
    if (destEdit) { try { await adminService.deleteDestinationImage(destEdit, imgUrl); } catch { /* ignore */ } }
  };
  const onDestFileChange = (e) => {
    const files = Array.from(e.target.files);
    const total = destCurImages.length + destImgFiles.length + files.length;
    if (total > 10) { alert('Хамгийн ихдээ 10 зураг байж болно!'); return; }
    setDestImgFiles((prev) => [...prev, ...files].slice(0, 10));
    e.target.value = '';
  };
  const removeDestNewFile = (idx) => setDestImgFiles((prev) => prev.filter((_, i) => i !== idx));

  const toggleDestActive = async (d) => {
    try { const r = await adminService.updateDestination(d._id, { isActive: !d.isActive }); setDestinations((p) => p.map((x) => x._id === d._id ? (r.data.destination || r.data) : x)); }
    catch { alert('Update failed.'); }
  };

  /* ── Destinations Hero helpers ── */
  const openHeroCreate = () => { setDestHeroEdit(null); setDestHeroForm(EMPTY_HERO); setDestHeroBgFile(null); setDestHeroMsg(''); setDestHeroModal(true); };
  const openHeroEdit   = (h) => {
    setDestHeroEdit(h._id);
    setDestHeroForm({ title: h.title||'', subtitle: h.subtitle||h.text||'', eyebrow: h.eyebrow||'', imageUrl: h.imageUrl||h.image||'', validFrom: h.validFrom ? new Date(h.validFrom).toISOString().slice(0,10) : '', isActive: h.isActive??true });
    setDestHeroBgFile(null); setDestHeroMsg(''); setDestHeroModal(true);
  };
  const closeHero = () => { setDestHeroModal(false); setDestHeroMsg(''); setDestHeroBgFile(null); };
  const setH = (k) => (e) => setDestHeroForm((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const uploadHeroBg = async () => {
    if (!destHeroBgFile) return destHeroForm.imageUrl;
    setDestHeroBgUploading(true);
    try {
      const fd = new FormData(); fd.append('image', destHeroBgFile);
      const res = await adminService.uploadContentImage(fd);
      const url = res.data.imageUrl || res.data.path || '';
      setDestHeroForm((p) => ({ ...p, imageUrl: url }));
      setDestHeroBgFile(null);
      return url;
    } catch { setDestHeroMsg('❌ Image upload failed.'); return destHeroForm.imageUrl; }
    finally { setDestHeroBgUploading(false); }
  };

  const saveHero = async (e) => {
    e.preventDefault(); setDestHeroSaving(true); setDestHeroMsg('');
    let imageUrl = destHeroForm.imageUrl;
    if (destHeroBgFile) imageUrl = await uploadHeroBg();
    const uniqueKey = destHeroEdit
      ? destHeroList.find((h) => h._id === destHeroEdit)?.key || `destinations_hero_${Date.now()}`
      : `destinations_hero_${Date.now()}`;
    const payload = {
      key: uniqueKey,
      title: destHeroForm.title,
      subtitle: destHeroForm.subtitle,
      eyebrow: destHeroForm.eyebrow,
      text: destHeroForm.subtitle,
      imageUrl,
      section: 'destinations_hero',
      isActive: destHeroForm.isActive,
      validFrom: destHeroForm.validFrom || null,
    };
    try {
      if (destHeroEdit) {
        const r = await adminService.updateContent(destHeroEdit, payload);
        const updated = r.data.content || r.data;
        setDestHeroList((p) => p.map((x) => x._id === destHeroEdit ? updated : x));
        setDestHeroMsg('✅ Hero updated!');
      } else {
        const r = await adminService.createContent(payload);
        const created = r.data.content || r.data;
        setDestHeroList((p) => [created, ...p]);
        setDestHeroMsg('✅ Hero created!');
      }
      setTimeout(closeHero, 900);
    } catch (err) { setDestHeroMsg('❌ ' + (err.response?.data?.message || 'Save failed.')); }
    finally { setDestHeroSaving(false); }
  };

  const deleteHero = async (id) => {
    if (!window.confirm('Delete this hero entry?')) return;
    try { await adminService.deleteContent(id); setDestHeroList((p) => p.filter((x) => x._id !== id)); }
    catch { alert('Delete failed.'); }
  };

  const toggleHeroActive = async (h) => {
    try {
      const r = await adminService.updateContent(h._id, { ...h, imageUrl: h.imageUrl || h.image, isActive: !h.isActive });
      setDestHeroList((p) => p.map((x) => x._id === h._id ? (r.data.content || r.data) : x));
    } catch { alert('Update failed.'); }
  };

  /* ── Festival helpers ── */
  const openFestCreate = () => { setFestEdit(null); setFestForm(EMPTY_FEST); setFestCurImages([]); setFestImgFiles([]); setFestMsg(''); setFestModal(true); };
  const openFestEdit   = (f) => {
    setFestEdit(f._id);
    setFestForm({ name: f.name||'', description: f.description||'', date: f.date||'', location: f.location||'', image: f.image||'', images: f.images||[], category: f.category||'culture', link: f.link||'', isActive: f.isActive??true });
    setFestCurImages(f.images || []); setFestImgFiles([]); setFestMsg(''); setFestModal(true);
  };
  const closeFest = () => { setFestModal(false); setFestMsg(''); setFestImgFiles([]); setFestCurImages([]); };
  const setF = (k) => (e) => setFestForm((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const saveFest = async (e) => {
    e.preventDefault(); setFestSaving(true); setFestMsg('');
    const payload = { ...festForm, images: festCurImages };
    try {
      let savedId = festEdit;
      if (festEdit) {
        const r = await adminService.updateFestival(festEdit, payload);
        const updated = r.data.festival || r.data;
        setFestivals((p) => p.map((x) => x._id === festEdit ? updated : x));
        setFestMsg('✅ Updated!');
      } else {
        const r = await adminService.createFestival(payload);
        const created = r.data.festival || r.data;
        savedId = created._id;
        setFestivals((p) => [created, ...p]);
        setFestMsg('✅ Created!'); setFestForm(EMPTY_FEST);
      }
      if (festImgFiles.length > 0 && savedId) {
        const fd = new FormData();
        festImgFiles.forEach((f) => fd.append('images', f));
        const upRes = await adminService.uploadFestivalImages(savedId, fd);
        const updatedImages = upRes.data.images || [];
        setFestivals((p) => p.map((x) => x._id === savedId ? { ...x, images: updatedImages } : x));
        setFestImgFiles([]);
      }
      setTimeout(closeFest, 900);
    } catch (err) { setFestMsg('❌ ' + (err.response?.data?.message || 'Save failed.')); }
    finally { setFestSaving(false); }
  };
  const deleteFest = async (id) => {
    if (!window.confirm('Delete this festival?')) return;
    try { await adminService.deleteFestival(id); setFestivals((p) => p.filter((x) => x._id !== id)); }
    catch { alert('Delete failed.'); }
  };
  const removeFestCurImage = async (imgUrl) => {
    setFestCurImages((prev) => prev.filter((x) => x !== imgUrl));
    if (festEdit) { try { await adminService.deleteFestivalImage(festEdit, imgUrl); } catch { /* ignore */ } }
  };
  const onFestFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (festCurImages.length + festImgFiles.length + files.length > 10) { alert('Хамгийн ихдээ 10 зураг байж болно!'); return; }
    setFestImgFiles((prev) => [...prev, ...files].slice(0, 10));
    e.target.value = '';
  };
  const removeFestNewFile = (idx) => setFestImgFiles((prev) => prev.filter((_, i) => i !== idx));
  const toggleFestActive = async (f) => {
    try { const r = await adminService.updateFestival(f._id, { isActive: !f.isActive }); setFestivals((p) => p.map((x) => x._id === f._id ? (r.data.festival || r.data) : x)); }
    catch { alert('Update failed.'); }
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>Admin Panel</h1>
            <p className={styles.subtitle}>Manage the ITravelz platform</p>
          </div>
        </div>

        {loading && <div className="page-loader" style={{ minHeight: 300 }}><span className="spinner spinner-dark" /> Loading…</div>}
        {error   && <div className="alert alert-error"><i className="fas fa-exclamation-circle" /> {error}</div>}

        {!loading && !error && (<>

          {/* ── Tabs ── */}
          <div className={styles.tabs}>
            {TABS.map((t) => (
              <button key={t} className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`} onClick={() => setTab(t)}>
                <i className={`fas ${
                  t==='overview'?'fa-chart-bar':
                  t==='bookings'?'fa-calendar-check':
                  t==='packages'?'fa-box-open':
                  t==='itineraries'?'fa-route':
                  t==='destinations'?'fa-globe':
                  t==='festivals'?'fa-drum':
                  'fa-users'
                }`} />
                {' '}{t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* ── Overview ── */}
          {tab === 'overview' && stats && (
            <div className={styles.statsGrid}>
              {[
                { icon: 'fa-users',          label: 'Total Users',    val: stats.totalUsers    ?? '—' },
                { icon: 'fa-calendar-check', label: 'Total Bookings', val: stats.totalBookings ?? '—' },
                { icon: 'fa-dollar-sign',    label: 'Total Revenue',  val: stats.totalRevenue  ? `$${Number(stats.totalRevenue).toLocaleString()}` : '—' },
                { icon: 'fa-box-open',       label: 'Packages',       val: packages.length },
              ].map(({ icon, label, val }) => (
                <div key={label} className={styles.statCard}>
                  <div className={styles.statIcon}><i className={`fas ${icon}`} /></div>
                  <div><strong>{val}</strong><span>{label}</span></div>
                </div>
              ))}
            </div>
          )}

          {/* ── Bookings ── */}
          {tab === 'bookings' && (
            <div>
              <div className={styles.filterBar}>
                <span className={styles.filterLabel}>Filter:</span>
                {['all', ...BOOKING_STATUSES].map((s) => (
                  <button key={s} onClick={() => setBFilter(s)} className={`${styles.filterBtn} ${bFilter===s?styles.filterActive:''}`}>
                    {s.charAt(0).toUpperCase()+s.slice(1)}
                    <span className={styles.filterCount}>{s==='all'?bookings.length:bookings.filter((b)=>b.status===s).length}</span>
                  </button>
                ))}
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead><tr><th>ID</th><th>Customer</th><th>Service</th><th>Date</th><th>People</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {filteredBookings.length === 0 && <tr><td colSpan={8} style={{textAlign:'center',color:'var(--text-muted)',padding:32}}>No bookings found</td></tr>}
                    {filteredBookings.map((b) => (
                      <tr key={b._id}>
                        <td><code style={{fontSize:12}}>{b.bookingId||b._id.slice(-6)}</code></td>
                        <td><div style={{fontWeight:600}}>{b.fullName||'—'}</div><div style={{fontSize:12,color:'var(--text-muted)'}}>{b.email}</div></td>
                        <td>{b.serviceName||b.packageName||'—'}</td>
                        <td>{b.bookingDate||b.travelDate?new Date(b.bookingDate||b.travelDate).toLocaleDateString():'—'}</td>
                        <td style={{textAlign:'center'}}>{b.numberOfPeople||b.numberOfGuests||1}</td>
                        <td style={{fontWeight:600}}>{b.totalPrice?`$${Number(b.totalPrice).toLocaleString()}`:b.price?`$${Number(b.price).toLocaleString()}`:'—'}</td>
                        <td>
                          <span className={`badge badge-${b.status==='approved'?'success':b.status==='cancelled'?'error':b.status==='completed'?'primary':'accent'}`}>{b.status}</span>
                        </td>
                        <td>
                          <div className={styles.actions}>
                            {b.status==='pending'&&<><button className={styles.btnApprove} title="Approve & email user" onClick={()=>approveBook(b._id)}><i className="fas fa-check"/>Approve</button><button className={styles.btnDecline} title="Decline & email user" onClick={()=>declineBook(b._id)}><i className="fas fa-times"/>Decline</button></>}
                            <button className={styles.btnView} onClick={()=>setBDetail(b)}><i className="fas fa-eye"/></button>
                            <button className={styles.btnDel} onClick={()=>deleteBooking(b._id)}><i className="fas fa-trash"/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Packages ── */}
          {tab === 'packages' && (
            <div>
              <div className={styles.tabToolbar}>
                <span>{packages.length} package{packages.length!==1?'s':''}</span>
                <button className="btn btn-primary btn-sm" onClick={openPkgCreate}><i className="fas fa-plus"/> Add Package</button>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead><tr><th>Image</th><th>Name</th><th>Destination</th><th>Duration</th><th>Price</th><th>Category</th><th>Dates</th><th>Max Guests/Slot</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {packages.length===0&&<tr><td colSpan={10} style={{textAlign:'center',color:'var(--text-muted)',padding:32}}>No packages yet — click "Add Package"</td></tr>}
                    {packages.map((p) => (
                      <tr key={p._id}>
                        <td>
                          {(p.images?.[0] || p.image)
                            ? <div style={{position:'relative',display:'inline-block'}}>
                                <img src={p.images?.[0] || p.image} alt="" style={{width:56,height:40,objectFit:'cover',borderRadius:6}} onError={(e)=>{e.target.style.display='none'}}/>
                                {(p.images||[]).length > 1 && <span style={{position:'absolute',bottom:2,right:2,background:'rgba(0,0,0,0.6)',color:'#fff',fontSize:9,padding:'1px 4px',borderRadius:4}}>{(p.images||[]).length}</span>}
                              </div>
                            : <div style={{width:56,height:40,background:'var(--bg-alt)',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-muted)',fontSize:18}}><i className="fas fa-image"/></div>}
                        </td>
                        <td><div style={{fontWeight:600}}>{p.name}</div><div style={{fontSize:12,color:'var(--text-muted)'}}>{(p.features||[]).slice(0,2).join(' · ')}</div></td>
                        <td>{p.destination}</td>
                        <td>{p.duration}</td>
                        <td style={{fontWeight:600}}>${Number(p.price).toLocaleString()}</td>
                        <td><span className="badge badge-accent">{p.category}</span></td>
                        <td style={{fontSize:12,color:'var(--text-muted)'}}>{(p.availableDates||[]).length>0?`${(p.availableDates||[]).length} date(s)`:'Any date'}</td>
                        <td style={{fontSize:12,textAlign:'center'}}>
                          <span style={{fontWeight:700,color:'var(--primary)',fontSize:16}}>{p.bookingLimitPerSlot||5}</span>
                          <span style={{display:'block',color:'var(--text-muted)',fontSize:10}}>per slot</span>
                        </td>
                        <td><span className={`badge badge-${p.status==='active'?'success':'error'}`}>{p.status}</span></td>
                        <td><div className={styles.actions}><button className={styles.btnEdit} onClick={()=>openPkgEdit(p)}><i className="fas fa-pen"/></button><button className={styles.btnDel} onClick={()=>deletePkg(p._id)}><i className="fas fa-trash"/></button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Itineraries ── */}
          {tab === 'itineraries' && (
            <div>
              <div className={styles.tabToolbar}>
                <span>{itineraries.length} itinerar{itineraries.length!==1?'ies':'y'}</span>
                <button className="btn btn-primary btn-sm" onClick={openItinCreate}><i className="fas fa-plus"/> Add Itinerary</button>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead><tr><th>Images</th><th>Title</th><th>Locations</th><th>Duration</th><th>Difficulty</th><th>Price</th><th>Order</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {itineraries.length===0&&<tr><td colSpan={9} style={{textAlign:'center',color:'var(--text-muted)',padding:32}}>No itineraries yet — click "Add Itinerary"</td></tr>}
                    {itineraries.map((it) => (
                      <tr key={it._id}>
                        <td>
                          {(it.images?.[0] || it.image)
                            ? <div style={{position:'relative',display:'inline-block'}}>
                                <img src={it.images?.[0] || it.image} alt="" style={{width:56,height:40,objectFit:'cover',borderRadius:6}} onError={(e)=>{e.target.style.display='none'}}/>
                                {(it.images||[]).length > 1 && <span style={{position:'absolute',bottom:2,right:2,background:'rgba(0,0,0,0.6)',color:'#fff',fontSize:9,padding:'1px 4px',borderRadius:4}}>{(it.images||[]).length}</span>}
                              </div>
                            : <div style={{width:56,height:40,background:'var(--bg-alt)',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-muted)',fontSize:18}}><i className="fas fa-route"/></div>}
                        </td>
                        <td><div style={{fontWeight:600}}>{it.title}</div></td>
                        <td style={{fontSize:12,color:'var(--text-muted)'}}>{it.locations||'—'}</td>
                        <td>{it.duration||'—'}</td>
                        <td><span className={`badge badge-${it.difficulty==='easy'?'success':it.difficulty==='challenging'?'error':'accent'}`}>{it.difficulty||'moderate'}</span></td>
                        <td style={{fontWeight:600}}>{it.price?`$${Number(it.price).toLocaleString()}`:'—'}</td>
                        <td style={{textAlign:'center'}}>{it.order||0}</td>
                        <td><span className={`badge badge-${it.isActive?'success':'error'}`}>{it.isActive?'Active':'Hidden'}</span></td>
                        <td><div className={styles.actions}><button className={styles.btnEdit} onClick={()=>openItinEdit(it)}><i className="fas fa-pen"/></button><button className={styles.btnDel} onClick={()=>deleteItin(it._id)}><i className="fas fa-trash"/></button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Destinations ── */}
          {tab === 'destinations' && (
            <div>
              {/* ── Page Hero / Header Scheduling ── */}
              <div style={{marginBottom:32,background:'var(--bg-alt)',borderRadius:14,padding:'20px 24px',border:'1px solid var(--border)'}}>
                <div className={styles.tabToolbar} style={{marginBottom:16}}>
                  <div>
                    <h3 style={{fontSize:15,fontWeight:700,margin:0}}>
                      <i className="fas fa-image" style={{marginRight:8,color:'var(--primary)'}}/>
                      Destinations Page Header
                    </h3>
                    <p style={{fontSize:12,color:'var(--text-muted)',margin:'4px 0 0'}}>
                      Хуудасны гарчиг, дэд гарчиг, ар дэвсгэр зургийг огноогоор удирдах
                    </p>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={openHeroCreate}>
                    <i className="fas fa-plus"/> Add Hero Entry
                  </button>
                </div>
                {destHeroList.length === 0 ? (
                  <p style={{color:'var(--text-muted)',fontSize:13,textAlign:'center',padding:'12px 0'}}>
                    No hero entries yet — click "Add Hero Entry" to set a custom page header.
                  </p>
                ) : (
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead><tr><th>BG Image</th><th>Title</th><th>Subtitle</th><th>Valid From</th><th>Status</th><th>Actions</th></tr></thead>
                      <tbody>
                        {destHeroList.map((h) => (
                          <tr key={h._id}>
                            <td>
                              {(h.imageUrl || h.image)
                                ? <img src={h.imageUrl||h.image} alt="" style={{width:64,height:40,objectFit:'cover',borderRadius:6}} onError={(e)=>e.target.style.display='none'}/>
                                : <div style={{width:64,height:40,background:'var(--bg)',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-muted)',fontSize:16}}><i className="fas fa-image"/></div>}
                            </td>
                            <td style={{fontWeight:600}}>{h.title||'—'}</td>
                            <td style={{fontSize:12,color:'var(--text-muted)',maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{h.subtitle||h.text||'—'}</td>
                            <td style={{fontSize:12}}>
                              {h.validFrom ? (
                                <span style={{color:'var(--primary)',fontWeight:600}}>
                                  <i className="fas fa-calendar-day" style={{marginRight:4}}/>
                                  {new Date(h.validFrom).toLocaleDateString()}
                                </span>
                              ) : <span style={{color:'var(--text-muted)'}}>Always</span>}
                            </td>
                            <td>
                              <button onClick={()=>toggleHeroActive(h)} className={`${styles.toggleBtn} ${h.isActive?styles.toggleOn:styles.toggleOff}`}>
                                {h.isActive?'Active':'Hidden'}
                              </button>
                            </td>
                            <td>
                              <div className={styles.actions}>
                                <button className={styles.btnEdit} onClick={()=>openHeroEdit(h)}><i className="fas fa-pen"/></button>
                                <button className={styles.btnDel} onClick={()=>deleteHero(h._id)}><i className="fas fa-trash"/></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* ── Destinations List ── */}
              <div className={styles.tabToolbar}>
                <span>{destinations.length} destination{destinations.length!==1?'s':''}</span>
                <button className="btn btn-primary btn-sm" onClick={openDestCreate}><i className="fas fa-plus"/> Add Destination</button>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead><tr><th>Image</th><th>Name</th><th>Location</th><th>Category</th><th>Tagline</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {destinations.length===0&&<tr><td colSpan={7} style={{textAlign:'center',color:'var(--text-muted)',padding:32}}>No destinations yet — click "Add Destination"</td></tr>}
                    {destinations.map((d) => (
                      <tr key={d._id}>
                        <td>
                          {d.image
                            ? <img src={d.image} alt="" style={{width:56,height:40,objectFit:'cover',borderRadius:6}} onError={(e)=>{e.target.style.display='none'}}/>
                            : <div style={{width:56,height:40,background:'var(--bg-alt)',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-muted)',fontSize:18}}><i className="fas fa-mountain"/></div>}
                        </td>
                        <td><div style={{fontWeight:600}}>{d.name}</div></td>
                        <td style={{fontSize:12,color:'var(--text-muted)'}}>{[d.city,d.country].filter(Boolean).join(', ')||'—'}</td>
                        <td><span className="badge badge-accent">{d.category}</span></td>
                        <td style={{fontSize:12,maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.tagline||'—'}</td>
                        <td><button onClick={()=>toggleDestActive(d)} className={`${styles.toggleBtn} ${d.isActive?styles.toggleOn:styles.toggleOff}`}>{d.isActive?'Active':'Hidden'}</button></td>
                        <td><div className={styles.actions}><button className={styles.btnEdit} onClick={()=>openDestEdit(d)}><i className="fas fa-pen"/></button><button className={styles.btnDel} onClick={()=>deleteDest(d._id)}><i className="fas fa-trash"/></button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Users ── */}
          {tab === 'users' && (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                  <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
                  <tbody>{users.map((u)=>(<tr key={u._id}><td>{u.name}</td><td>{u.email}</td><td><span className={`badge ${u.role==='admin'?'badge-primary':'badge-accent'}`}>{u.role}</span></td><td>{u.createdAt?new Date(u.createdAt).toLocaleDateString():'—'}</td></tr>))}</tbody>
              </table>
            </div>
          )}

          {/* ── Festivals ── */}
          {tab === 'festivals' && (
            <div>
              <div className={styles.tabToolbar}>
                <span>{festivals.length} festival{festivals.length!==1?'s':''}</span>
                <button className="btn btn-primary btn-sm" onClick={openFestCreate}><i className="fas fa-plus"/> Add Festival</button>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead><tr><th>Image</th><th>Name</th><th>Date</th><th>Location</th><th>Category</th><th>Link</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {festivals.length===0&&<tr><td colSpan={8} style={{textAlign:'center',color:'var(--text-muted)',padding:32}}>No festivals yet — click "Add Festival"</td></tr>}
                    {festivals.map((f) => (
                      <tr key={f._id}>
                        <td>
                          {(f.images?.[0]||f.image)
                            ? <img src={f.images?.[0]||f.image} alt="" style={{width:56,height:40,objectFit:'cover',borderRadius:6}} onError={(e)=>e.target.style.display='none'}/>
                            : <div style={{width:56,height:40,background:'var(--bg-alt)',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-muted)',fontSize:18}}><i className="fas fa-drum"/></div>}
                        </td>
                        <td><div style={{fontWeight:600}}>{f.name}</div>{f.images?.length>1&&<div style={{fontSize:11,color:'var(--text-muted)'}}><i className="fas fa-images"/> {f.images.length} imgs</div>}</td>
                        <td style={{fontSize:12,color:'var(--text-muted)'}}>{f.date||'—'}</td>
                        <td style={{fontSize:12,color:'var(--text-muted)'}}>{f.location||'—'}</td>
                        <td><span className="badge badge-accent" style={{textTransform:'capitalize'}}>{f.category||'—'}</span></td>
                        <td style={{fontSize:12}}>
                          {f.link
                            ? <a href={f.link} target="_blank" rel="noopener noreferrer" style={{color:'var(--primary)',textDecoration:'underline',maxWidth:120,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',display:'block'}}><i className="fas fa-external-link-alt"/> Link</a>
                            : <span style={{color:'var(--text-muted)'}}>—</span>}
                        </td>
                        <td><button onClick={()=>toggleFestActive(f)} className={`${styles.toggleBtn} ${f.isActive?styles.toggleOn:styles.toggleOff}`}>{f.isActive?'Active':'Hidden'}</button></td>
                        <td><div className={styles.actions}><button className={styles.btnEdit} onClick={()=>openFestEdit(f)}><i className="fas fa-pen"/></button><button className={styles.btnDel} onClick={()=>deleteFest(f._id)}><i className="fas fa-trash"/></button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </>)}
      </div>

      {/* ── Booking Detail Modal ── */}
      {bDetail && (
        <Modal title="Booking Details" onClose={()=>setBDetail(null)}>
          <div className={styles.detailGrid}>
            {[['Booking ID',bDetail.bookingId||bDetail._id],['Customer',bDetail.fullName||'—'],['Email',bDetail.email||'—'],['Phone',bDetail.phone||'—'],['Service',bDetail.serviceName||bDetail.packageName||'—'],['Duration',bDetail.duration||'—'],['Date',bDetail.bookingDate||bDetail.travelDate?new Date(bDetail.bookingDate||bDetail.travelDate).toLocaleDateString():'—'],['Time',bDetail.bookingTime||'—'],['People',bDetail.numberOfPeople||bDetail.numberOfGuests||1],['Total',bDetail.totalPrice?`$${Number(bDetail.totalPrice).toLocaleString()}`:bDetail.price?`$${Number(bDetail.price).toLocaleString()}`:'—'],['Notes',bDetail.notes||bDetail.specialRequests||'—']].map(([label,val])=>(
              <div key={label} className={styles.detailRow}><span className={styles.detailLabel}>{label}</span><span className={styles.detailVal}>{String(val)}</span></div>
            ))}
            <div className={styles.detailRow}><span className={styles.detailLabel}>Status</span>
              <span className={`badge badge-${bDetail.status==='approved'?'success':bDetail.status==='cancelled'?'error':bDetail.status==='completed'?'primary':'accent'}`}>{bDetail.status}</span>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button className="btn btn-outline btn-sm" onClick={()=>setBDetail(null)}>Close</button>
            {bDetail.status==='pending'&&(
              <><button className="btn btn-sm" style={{background:'#10b981',color:'#fff'}} onClick={()=>approveBook(bDetail._id)}><i className="fas fa-check"/> Approve</button>
              <button className="btn btn-sm" style={{background:'#ef4444',color:'#fff'}} onClick={()=>declineBook(bDetail._id)}><i className="fas fa-times"/> Decline</button></>
            )}
            {bDetail.status==='approved'&&(
              <button className="btn btn-sm" style={{background:'var(--primary)',color:'#fff'}} onClick={()=>updateStatus(bDetail._id,'completed')}><i className="fas fa-flag-checkered"/> Mark Completed</button>
            )}
            <button className="btn btn-error btn-sm" onClick={()=>deleteBooking(bDetail._id)}><i className="fas fa-trash"/> Delete</button>
          </div>
        </Modal>
      )}

      {/* ── Package Create/Edit Modal ── */}
      {pkgModal && (
        <Modal title={pkgEdit?'Edit Package':'Add Package'} onClose={closePkg}>
          <form onSubmit={savePkg} className={styles.itinForm}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Package Name *</label>
                <input className="form-input" value={pkgForm.name} onChange={setP('name')} required placeholder="e.g. Bali Explorer"/>
              </div>
              <div className={styles.formGroup}>
                <label>Category *</label>
                <select className="form-input" value={pkgForm.category} onChange={setP('category')}>
                  {CATEGORIES.map((c)=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Destination *</label>
                <input className="form-input" value={pkgForm.destination} onChange={setP('destination')} required placeholder="e.g. Bali, Indonesia"/>
              </div>
              <div className={styles.formGroup}>
                <label>Duration *</label>
                <input className="form-input" value={pkgForm.duration} onChange={setP('duration')} required placeholder="e.g. 7 Days"/>
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Price (USD) *</label>
                <input className="form-input" type="number" min="0" step="0.01" value={pkgForm.price} onChange={setP('price')} required placeholder="1299"/>
              </div>
              <div className={styles.formGroup}>
                <label>Status</label>
                <select className="form-input" value={pkgForm.status} onChange={setP('status')}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>
                Images <span style={{fontWeight:400,color:'var(--text-muted)'}}>Утас/компьютерээс upload хийх (хамгийн ихдээ 10)</span>
              </label>

              {/* Existing saved images */}
              {pkgCurImages.length > 0 && (
                <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:8}}>
                  {pkgCurImages.map((src, i) => {
                    const baseUrl = (typeof window !== 'undefined' && import.meta?.env?.VITE_API_URL)
                      ? import.meta.env.VITE_API_URL.replace('/api','')
                      : '';
                    const resolved = src.startsWith('http') ? src : `${baseUrl}${src}`;
                    return (
                      <div key={i} style={{position:'relative',width:72,height:52}}>
                        <img src={resolved} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:6}} onError={(e)=>e.target.style.display='none'}/>
                        <button type="button" onClick={()=>removePkgCurImage(src)}
                          style={{position:'absolute',top:-6,right:-6,width:18,height:18,borderRadius:'50%',background:'#ef4444',border:'none',color:'#fff',fontSize:10,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',padding:0}}>
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pending new files */}
              {pkgImgFiles.length > 0 && (
                <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:8}}>
                  {pkgImgFiles.map((f, i) => (
                    <div key={i} style={{position:'relative',width:72,height:52}}>
                      <img src={URL.createObjectURL(f)} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:6,opacity:0.75,border:'2px dashed var(--primary)'}}/>
                      <button type="button" onClick={()=>removePkgNewFile(i)}
                        style={{position:'absolute',top:-6,right:-6,width:18,height:18,borderRadius:'50%',background:'#ef4444',border:'none',color:'#fff',fontSize:10,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',padding:0}}>
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* File picker */}
              {(pkgCurImages.length + pkgImgFiles.length) < 10 && (
                <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',color:'var(--primary)',fontSize:13}}>
                  <i className="fas fa-cloud-upload-alt"/>
                  <span>Зураг нэмэх ({pkgCurImages.length + pkgImgFiles.length}/10)</span>
                  <input type="file" accept="image/*" multiple style={{display:'none'}} onChange={onPkgFileChange}/>
                </label>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>Description *</label>
              <textarea className="form-input" rows={3} value={pkgForm.description} onChange={setP('description')} required placeholder="Describe the package…" style={{resize:'vertical'}}/>
            </div>
            <div className={styles.formGroup}>
              <label>Features <span style={{fontWeight:400,color:'var(--text-muted)'}}>(comma separated)</span></label>
              <input className="form-input" value={pkgForm.features} onChange={setP('features')} placeholder="Airport transfer, Hotel, Guide, Meals"/>
            </div>

            {/* Available Dates */}
            <div className={styles.formGroup}>
              <label>Available Dates <span style={{fontWeight:400,color:'var(--text-muted)'}}>(leave empty = any date)</span></label>
              <div className={styles.dateRow}>
                <input className="form-input" type="date" value={newDate} onChange={(e)=>setNewDate(e.target.value)} style={{flex:1}}/>
                <button type="button" className="btn btn-primary btn-sm" onClick={addDate}><i className="fas fa-plus"/></button>
              </div>
              {pkgForm.availableDates.length>0 && (
                <div className={styles.tagList}>
                  {pkgForm.availableDates.map((d)=>(
                    <span key={d} className={styles.tag}>{d}<button type="button" onClick={()=>removeDate(d)}>×</button></span>
                  ))}
                </div>
              )}
            </div>

            {/* Available Times */}
            <div className={styles.formGroup}>
              <label>Available Times <span style={{fontWeight:400,color:'var(--text-muted)'}}>(leave empty = any time)</span></label>
              <div className={styles.dateRow}>
                <input className="form-input" type="time" value={newTime} onChange={(e)=>setNewTime(e.target.value)} style={{flex:1}}/>
                <button type="button" className="btn btn-primary btn-sm" onClick={addTime}><i className="fas fa-plus"/></button>
              </div>
              {pkgForm.availableTimes.length>0 && (
                <div className={styles.tagList}>
                  {pkgForm.availableTimes.map((t)=>(
                    <span key={t} className={styles.tag}>{t}<button type="button" onClick={()=>removeTime(t)}>×</button></span>
                  ))}
                </div>
              )}
            </div>

            {/* Booking Capacity */}
            <div className={styles.formGroup}>
              <label>
                Max Guests per Slot
                <span style={{fontWeight:400,color:'var(--text-muted)',marginLeft:6}}>How many total people can book the same date+time</span>
              </label>
              <input
                className="form-input"
                type="number"
                min="1"
                max="500"
                value={pkgForm.bookingLimitPerSlot}
                onChange={setP('bookingLimitPerSlot')}
                placeholder="5"
              />
            </div>

            {pkgMsg && <p className={styles.formMsg}>{pkgMsg}</p>}
            <div className={styles.modalFooter}>
              <button type="button" className="btn btn-outline btn-sm" onClick={closePkg}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={pkgSaving}>
                {pkgSaving?<><span className="spinner"/> Saving…</>:pkgEdit?'Save Changes':'Create Package'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Itinerary Create/Edit Modal ── */}
      {itinModal && (
        <Modal title={itinEdit?'Edit Itinerary':'Add Itinerary'} onClose={closeItin}>
          <form onSubmit={saveItin} className={styles.itinForm}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Title *</label>
                <input className="form-input" value={itinForm.title} onChange={setI('title')} required placeholder="e.g. Classic Bali 7-Day Tour"/>
              </div>
              <div className={styles.formGroup}>
                <label>Difficulty</label>
                <select className="form-input" value={itinForm.difficulty} onChange={setI('difficulty')}>
                  {DIFFICULTIES.map((d)=><option key={d} value={d}>{d.charAt(0).toUpperCase()+d.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Duration *</label>
                <input className="form-input" value={itinForm.duration} onChange={setI('duration')} required placeholder="e.g. 7 Days"/>
              </div>
              <div className={styles.formGroup}>
                <label>Locations *</label>
                <input className="form-input" value={itinForm.locations} onChange={setI('locations')} required placeholder="e.g. 4 Cities"/>
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Price (USD/person)</label>
                <input className="form-input" type="number" min="0" step="0.01" value={itinForm.price} onChange={setI('price')} placeholder="1299"/>
              </div>
              <div className={styles.formGroup}>
                <label>Display Order</label>
                <input className="form-input" type="number" min="0" value={itinForm.order} onChange={setI('order')} placeholder="0"/>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>Description *</label>
              <textarea className="form-input" rows={3} value={itinForm.description} onChange={setI('description')} required placeholder="Describe the itinerary…" style={{resize:'vertical'}}/>
            </div>

            {/* Images upload */}
            <div className={styles.formGroup}>
              <label>Images <span style={{fontWeight:400,color:'var(--text-muted)'}}>Утас/компьютерээс upload хийх (хамгийн ихдээ 10)</span></label>
              {itinCurImages.length > 0 && (
                <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:8}}>
                  {itinCurImages.map((src, i) => {
                    const baseUrl = (import.meta?.env?.VITE_API_URL||'').replace('/api','');
                    const resolved = src.startsWith('http') ? src : `${baseUrl}${src}`;
                    return (
                      <div key={i} style={{position:'relative',width:72,height:52}}>
                        <img src={resolved} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:6}} onError={(e)=>e.target.style.display='none'}/>
                        <button type="button" onClick={()=>removeItinCurImage(src)}
                          style={{position:'absolute',top:-6,right:-6,width:18,height:18,borderRadius:'50%',background:'#ef4444',border:'none',color:'#fff',fontSize:10,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',padding:0}}>
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              {itinImgFiles.length > 0 && (
                <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:8}}>
                  {itinImgFiles.map((f, i) => (
                    <div key={i} style={{position:'relative',width:72,height:52}}>
                      <img src={URL.createObjectURL(f)} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:6,opacity:0.75,border:'2px dashed var(--primary)'}}/>
                      <button type="button" onClick={()=>removeItinNewFile(i)}
                        style={{position:'absolute',top:-6,right:-6,width:18,height:18,borderRadius:'50%',background:'#ef4444',border:'none',color:'#fff',fontSize:10,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',padding:0}}>
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {(itinCurImages.length + itinImgFiles.length) < 10 && (
                <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',color:'var(--primary)',fontSize:13}}>
                  <i className="fas fa-cloud-upload-alt"/>
                  <span>Зураг нэмэх ({itinCurImages.length + itinImgFiles.length}/10)</span>
                  <input type="file" accept="image/*" multiple style={{display:'none'}} onChange={onItinFileChange}/>
                </label>
              )}
            </div>

            <label className={styles.checkRow}>
              <input type="checkbox" checked={itinForm.isActive} onChange={setI('isActive')}/>
              <span>Visible to public (Active)</span>
            </label>

            {itinMsg && <p className={styles.formMsg}>{itinMsg}</p>}
            <div className={styles.modalFooter}>
              <button type="button" className="btn btn-outline btn-sm" onClick={closeItin}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={itinSaving}>
                {itinSaving?<><span className="spinner"/> Saving…</>:itinEdit?'Save Changes':'Create Itinerary'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Destination Create/Edit Modal ── */}
      {destModal && (
        <Modal title={destEdit?'Edit Destination':'Add Destination'} onClose={closeDest}>
          <form onSubmit={saveDest} className={styles.itinForm}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Destination Name *</label>
                <input className="form-input" value={destForm.name} onChange={setD('name')} required placeholder="e.g. Santorini"/>
              </div>
              <div className={styles.formGroup}>
                <label>Category *</label>
                <select className="form-input" value={destForm.category} onChange={setD('category')}>
                  {DEST_CATEGORIES.map((c)=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>City</label>
                <input className="form-input" value={destForm.city} onChange={setD('city')} placeholder="e.g. Thira"/>
              </div>
              <div className={styles.formGroup}>
                <label>Country</label>
                <input className="form-input" value={destForm.country} onChange={setD('country')} placeholder="e.g. Greece"/>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>Images <span style={{fontWeight:400,color:'var(--text-muted)'}}>Upload up to 10 images (5-second slideshow)</span></label>
              {destCurImages.length > 0 && (
                <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:8}}>
                  {destCurImages.map((src, i) => {
                    const baseUrl = (typeof window !== 'undefined' && import.meta?.env?.VITE_API_URL) ? import.meta.env.VITE_API_URL.replace('/api','') : '';
                    const resolved = src.startsWith('http') ? src : `${baseUrl}${src}`;
                    return (
                      <div key={i} style={{position:'relative',width:72,height:52}}>
                        <img src={resolved} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:6}} onError={(e)=>e.target.style.display='none'}/>
                        <button type="button" onClick={()=>removeDestCurImage(src)} style={{position:'absolute',top:-6,right:-6,width:18,height:18,borderRadius:'50%',background:'#ef4444',border:'none',color:'#fff',fontSize:10,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',padding:0}}>×</button>
                      </div>
                    );
                  })}
                </div>
              )}
              {destImgFiles.length > 0 && (
                <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:8}}>
                  {destImgFiles.map((f, i) => (
                    <div key={i} style={{position:'relative',width:72,height:52}}>
                      <img src={URL.createObjectURL(f)} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:6,opacity:0.75,border:'2px dashed var(--primary)'}}/>
                      <button type="button" onClick={()=>removeDestNewFile(i)} style={{position:'absolute',top:-6,right:-6,width:18,height:18,borderRadius:'50%',background:'#ef4444',border:'none',color:'#fff',fontSize:10,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',padding:0}}>×</button>
                    </div>
                  ))}
                </div>
              )}
              {(destCurImages.length + destImgFiles.length) < 10 && (
                <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',color:'var(--primary)',fontSize:13}}>
                  <i className="fas fa-cloud-upload-alt"/>
                  <span>Зураг нэмэх ({destCurImages.length + destImgFiles.length}/10)</span>
                  <input type="file" accept="image/*" multiple style={{display:'none'}} onChange={onDestFileChange}/>
                </label>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>Fallback Image URL <span style={{fontWeight:400,color:'var(--text-muted)'}}>Used if no uploaded images</span></label>
              <input className="form-input" value={destForm.image} onChange={setD('image')} placeholder="https://images.unsplash.com/..."/>
              {destForm.image && <img src={destForm.image} alt="preview" style={{marginTop:8,width:'100%',height:100,objectFit:'cover',borderRadius:8}} onError={(e)=>e.target.style.display='none'}/>}
            </div>
            <div className={styles.formGroup}>
              <label>
                <i className="fas fa-map-marked-alt" style={{marginRight:6,color:'var(--primary)'}}/>
                Location — Google Maps Picker
                <span style={{fontWeight:400,color:'var(--text-muted)',marginLeft:6,fontSize:12}}>Газар хайж, харж, сонгоно уу</span>
              </label>

              {/* Search row */}
              <div style={{display:'flex',gap:8,marginBottom:8}}>
                <input
                  className="form-input"
                  value={destMapSearch}
                  onChange={(e)=>setDestMapSearch(e.target.value)}
                  onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); handleMapSearch(); } }}
                  placeholder="Газар хайх... e.g. Улаанбаатар, Монгол"
                  style={{flex:1}}
                />
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleMapSearch}
                  style={{whiteSpace:'nowrap'}}
                >
                  <i className="fas fa-search"/> Хайх
                </button>
              </div>

              {/* Live map preview — like the Google Maps app */}
              {destMapPreview && (
                <div style={{borderRadius:12,overflow:'hidden',border:'2px solid var(--primary)',marginBottom:10,position:'relative',boxShadow:'0 4px 16px rgba(0,0,0,0.15)'}}>
                  <iframe
                    src={destMapPreview}
                    title="Map Preview"
                    width="100%"
                    height="300"
                    style={{border:0,display:'block'}}
                    allowFullScreen=""
                    loading="eager"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <div style={{position:'absolute',bottom:12,left:0,right:0,display:'flex',justifyContent:'center',pointerEvents:'none'}}>
                    <button
                      type="button"
                      onClick={applyMapLocation}
                      style={{pointerEvents:'auto',background:'var(--primary)',color:'#fff',border:'none',borderRadius:24,padding:'10px 22px',fontSize:13,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:7,boxShadow:'0 3px 12px rgba(0,0,0,0.35)',letterSpacing:0.3}}
                    >
                      <i className="fas fa-map-pin"/> Энэ байршлыг сонгох
                    </button>
                  </div>
                </div>
              )}

              {/* Currently saved location */}
              {destForm.location && (
                <div style={{display:'flex',alignItems:'center',gap:8,fontSize:12,color:'var(--text-muted)',marginBottom:8,background:'var(--bg-alt)',borderRadius:8,padding:'6px 10px',flexWrap:'wrap'}}>
                  <i className="fas fa-check-circle" style={{color:'#10b981',fontSize:14,flexShrink:0}}/>
                  <span style={{wordBreak:'break-all',flex:1}}>{destForm.location}</span>
                  <button
                    type="button"
                    onClick={clearMapLocation}
                    style={{background:'#ef4444',color:'#fff',border:'none',borderRadius:6,padding:'2px 10px',fontSize:11,cursor:'pointer',flexShrink:0}}
                  >
                    Устгах ×
                  </button>
                </div>
              )}

              {/* Manual paste fallback (collapsed by default) */}
              <details style={{marginTop:2}}>
                <summary style={{fontSize:12,color:'var(--text-muted)',cursor:'pointer',userSelect:'none'}}>
                  <i className="fas fa-code" style={{marginRight:4}}/>
                  Гараар URL / embed code оруулах
                </summary>
                <input
                  className="form-input"
                  style={{marginTop:6}}
                  value={destForm.location}
                  onChange={(e)=>{
                    setD('location')(e);
                    setDestMapSearch(e.target.value);
                    if (e.target.value) setDestMapPreview(buildMapEmbedUrl(e.target.value));
                    else setDestMapPreview('');
                  }}
                  placeholder="https://maps.google.com/?q=... эсвэл <iframe src=...>"
                />
              </details>
            </div>
            <div className={styles.formGroup}>
              <label>Tagline <span style={{fontWeight:400,color:'var(--text-muted)'}}>Short subtitle shown on card</span></label>
              <input className="form-input" value={destForm.tagline} onChange={setD('tagline')} placeholder="Where azure cliffs meet turquoise sea"/>
            </div>
            <div className={styles.formGroup}>
              <label>Description *</label>
              <textarea className="form-input" rows={3} value={destForm.description} onChange={setD('description')} required placeholder="General overview…" style={{resize:'vertical'}}/>
            </div>
            <div className={styles.formGroup}>
              <label>Cultural &amp; Historical Info</label>
              <textarea className="form-input" rows={4} value={destForm.culturalInfo} onChange={setD('culturalInfo')} placeholder="Rich cultural history, traditions, landmarks…" style={{resize:'vertical'}}/>
            </div>
            <div className={styles.formGroup}>
              <label>Read More <span style={{fontWeight:400,color:'var(--text-muted)'}}>Detailed text shown in the popup modal</span></label>
              <textarea className="form-input" rows={4} value={destForm.readMore} onChange={setD('readMore')} placeholder="Extended details, stories, tips…" style={{resize:'vertical'}}/>
            </div>
            <div className={styles.formGroup}>
              <label>Highlights <span style={{fontWeight:400,color:'var(--text-muted)'}}>One per line</span></label>
              <textarea className="form-input" rows={4} value={destForm.highlights} onChange={setD('highlights')} placeholder={"Sunset views from Oia\nVolcanic beaches\nWorld-class dining"} style={{resize:'vertical'}}/>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Best Time to Visit</label>
                <input className="form-input" value={destForm.bestTime} onChange={setD('bestTime')} placeholder="April – October"/>
              </div>
              <div className={styles.formGroup}>
                <label>Average Cost</label>
                <input className="form-input" value={destForm.avgCost} onChange={setD('avgCost')} placeholder="$150–$300 / day"/>
              </div>
            </div>
            <label className={styles.checkRow}>
              <input type="checkbox" checked={destForm.isActive} onChange={setD('isActive')}/>
              <span>Visible to public (Active)</span>
            </label>
            {destMsg && <p className={styles.formMsg}>{destMsg}</p>}
            <div className={styles.modalFooter}>
              <button type="button" className="btn btn-outline btn-sm" onClick={closeDest}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={destSaving}>
                {destSaving?<><span className="spinner"/> Saving…</>:destEdit?'Save Changes':'Create Destination'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Festival Create/Edit Modal ── */}
      {festModal && (
        <Modal title={festEdit ? 'Edit Festival' : 'Add Festival'} onClose={closeFest}>
          <form onSubmit={saveFest} className={styles.itinForm}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Festival Name *</label>
                <input className="form-input" value={festForm.name} onChange={setF('name')} required placeholder="e.g. Naadam Festival"/>
              </div>
              <div className={styles.formGroup}>
                <label>Category</label>
                <select className="form-input" value={festForm.category} onChange={setF('category')}>
                  {FEST_CATEGORIES.map((c)=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Date</label>
                <input className="form-input" value={festForm.date} onChange={setF('date')} placeholder="e.g. July 11–13"/>
              </div>
              <div className={styles.formGroup}>
                <label>Location</label>
                <input className="form-input" value={festForm.location} onChange={setF('location')} placeholder="e.g. Ulaanbaatar"/>
              </div>
            </div>

            {/* Images */}
            <div className={styles.formGroup}>
              <label>Images <span style={{fontWeight:400,color:'var(--text-muted)'}}>Upload up to 10 (5s slideshow)</span></label>
              {festCurImages.length > 0 && (
                <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:8}}>
                  {festCurImages.map((src, i) => {
                    const base = (import.meta?.env?.VITE_API_URL||'').replace('/api','');
                    const resolved = src.startsWith('http') ? src : `${base}${src}`;
                    return (
                      <div key={i} style={{position:'relative',width:72,height:52}}>
                        <img src={resolved} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:6}} onError={(e)=>e.target.style.display='none'}/>
                        <button type="button" onClick={()=>removeFestCurImage(src)} style={{position:'absolute',top:-6,right:-6,width:18,height:18,borderRadius:'50%',background:'#ef4444',border:'none',color:'#fff',fontSize:10,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',padding:0}}>×</button>
                      </div>
                    );
                  })}
                </div>
              )}
              {festImgFiles.length > 0 && (
                <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:8}}>
                  {festImgFiles.map((f, i) => (
                    <div key={i} style={{position:'relative',width:72,height:52}}>
                      <img src={URL.createObjectURL(f)} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:6,opacity:0.75,border:'2px dashed var(--primary)'}}/>
                      <button type="button" onClick={()=>removeFestNewFile(i)} style={{position:'absolute',top:-6,right:-6,width:18,height:18,borderRadius:'50%',background:'#ef4444',border:'none',color:'#fff',fontSize:10,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',padding:0}}>×</button>
                    </div>
                  ))}
                </div>
              )}
              {(festCurImages.length + festImgFiles.length) < 10 && (
                <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',color:'var(--primary)',fontSize:13}}>
                  <i className="fas fa-cloud-upload-alt"/>
                  <span>Зураг нэмэх ({festCurImages.length + festImgFiles.length}/10)</span>
                  <input type="file" accept="image/*" multiple style={{display:'none'}} onChange={onFestFileChange}/>
                </label>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Fallback Image URL <span style={{fontWeight:400,color:'var(--text-muted)'}}>Used if no uploaded images</span></label>
              <input className="form-input" value={festForm.image} onChange={setF('image')} placeholder="https://images.unsplash.com/..."/>
              {festForm.image && <img src={festForm.image} alt="preview" style={{marginTop:8,width:'100%',height:90,objectFit:'cover',borderRadius:8}} onError={(e)=>e.target.style.display='none'}/>}
            </div>

            <div className={styles.formGroup}>
              <label>
                <i className="fas fa-external-link-alt" style={{marginRight:6,color:'var(--primary)'}}/>
                External Link <span style={{fontWeight:400,color:'var(--text-muted)'}}>Дэлгэрэнгүй мэдээлэл авах холбоос (Wikipedia, нийтлэл гэх мэт)</span>
              </label>
              <input className="form-input" value={festForm.link} onChange={setF('link')} placeholder="https://en.wikipedia.org/wiki/Naadam"/>
              {festForm.link && (
                <a href={festForm.link} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:'var(--primary)',marginTop:4,display:'inline-flex',alignItems:'center',gap:4}}>
                  <i className="fas fa-external-link-alt"/> Preview link
                </a>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Description *</label>
              <textarea className="form-input" rows={4} value={festForm.description} onChange={setF('description')} required placeholder="Describe the festival…" style={{resize:'vertical'}}/>
            </div>

            <label className={styles.checkRow}>
              <input type="checkbox" checked={festForm.isActive} onChange={setF('isActive')}/>
              <span>Visible to public (Active)</span>
            </label>
            {festMsg && <p className={styles.formMsg}>{festMsg}</p>}
            <div className={styles.modalFooter}>
              <button type="button" className="btn btn-outline btn-sm" onClick={closeFest}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={festSaving}>
                {festSaving?<><span className="spinner"/> Saving…</>:festEdit?'Save Changes':'Create Festival'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Destination Hero Create/Edit Modal ── */}
      {destHeroModal && (
        <Modal title={destHeroEdit ? 'Edit Hero Entry' : 'Add Hero Entry'} onClose={closeHero}>
          <form onSubmit={saveHero} className={styles.itinForm}>
            <div className={styles.formGroup}>
              <label>Page Title *</label>
              <input className="form-input" value={destHeroForm.title} onChange={setH('title')} required placeholder="e.g. Explore Destinations"/>
            </div>
            <div className={styles.formGroup}>
              <label>Subtitle / Description</label>
              <textarea className="form-input" rows={2} value={destHeroForm.subtitle} onChange={setH('subtitle')} placeholder="A short subtitle shown below the title…" style={{resize:'vertical'}}/>
            </div>
            <div className={styles.formGroup}>
              <label>Eyebrow Label <span style={{fontWeight:400,color:'var(--text-muted)'}}>Small text above the title</span></label>
              <input className="form-input" value={destHeroForm.eyebrow} onChange={setH('eyebrow')} placeholder="e.g. Discover The World"/>
            </div>
            <div className={styles.formGroup}>
              <label>Background Image</label>
              {/* File upload for Cloudinary */}
              <label style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer',color:'var(--primary)',fontSize:13,marginBottom:8}}>
                <i className="fas fa-cloud-upload-alt"/>
                <span>{destHeroBgFile ? destHeroBgFile.name : 'Upload background image (Cloudinary)'}</span>
                <input type="file" accept="image/*" style={{display:'none'}} onChange={(e)=>{ const f=e.target.files[0]; if(f) setDestHeroBgFile(f); e.target.value=''; }}/>
              </label>
              {destHeroBgFile && (
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                  <img src={URL.createObjectURL(destHeroBgFile)} alt="" style={{width:120,height:70,objectFit:'cover',borderRadius:8,border:'2px dashed var(--primary)'}}/>
                  <button type="button" onClick={()=>setDestHeroBgFile(null)} style={{background:'#ef4444',color:'#fff',border:'none',borderRadius:6,padding:'4px 10px',cursor:'pointer',fontSize:12}}>Remove</button>
                </div>
              )}
              <input className="form-input" value={destHeroForm.imageUrl} onChange={setH('imageUrl')} placeholder="Or paste image URL: https://…"/>
              {!destHeroBgFile && destHeroForm.imageUrl && (
                <img src={destHeroForm.imageUrl} alt="preview" style={{marginTop:8,width:'100%',height:120,objectFit:'cover',borderRadius:8}} onError={(e)=>e.target.style.display='none'}/>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>
                Valid From Date{' '}
                <span style={{fontWeight:400,color:'var(--text-muted)'}}>
                  This header becomes active from this date onwards. Leave empty = always active.
                </span>
              </label>
              <input className="form-input" type="date" value={destHeroForm.validFrom} onChange={setH('validFrom')}/>
              {destHeroForm.validFrom && (
                <p style={{fontSize:12,color:'var(--primary)',marginTop:4}}>
                  <i className="fas fa-info-circle"/> Active from {new Date(destHeroForm.validFrom).toLocaleDateString()} onwards
                </p>
              )}
            </div>
            <label className={styles.checkRow}>
              <input type="checkbox" checked={destHeroForm.isActive} onChange={setH('isActive')}/>
              <span>Visible (Active)</span>
            </label>
            {destHeroMsg && <p className={styles.formMsg}>{destHeroMsg}</p>}
            <div className={styles.modalFooter}>
              <button type="button" className="btn btn-outline btn-sm" onClick={closeHero}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={destHeroSaving||destHeroBgUploading}>
                {(destHeroSaving||destHeroBgUploading) ? <><span className="spinner"/> Saving…</> : destHeroEdit ? 'Save Changes' : 'Create Hero Entry'}
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};

export default Admin;
