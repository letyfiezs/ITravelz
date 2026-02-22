import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import styles from './Admin.module.css';

const TABS             = ['overview', 'bookings', 'packages', 'destinations', 'users'];
const BOOKING_STATUSES = ['pending', 'approved', 'completed', 'cancelled'];
const CATEGORIES       = ['Beach', 'Cultural', 'Adventure', 'City', 'Nature', 'Romantic', 'Family', 'Cruise'];
const DEST_CATEGORIES  = ['Beach', 'Cultural', 'Adventure', 'City', 'Nature', 'Romantic', 'Family', 'Historical', 'Mountain', 'Desert'];

const EMPTY_PKG  = { name: '', description: '', price: '', category: 'Beach', duration: '', destination: '', image: '', features: '', status: 'active', availableDates: [], availableTimes: [], bookingLimitPerSlot: 5 };
const EMPTY_DEST = { name: '', city: '', country: '', category: 'Cultural', image: '', tagline: '', description: '', culturalInfo: '', highlights: '', bestTime: '', avgCost: '', isActive: true };

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

  /* package modal */
  const [pkgModal, setPkgModal]   = useState(false);
  const [pkgForm, setPkgForm]     = useState(EMPTY_PKG);
  const [pkgEdit, setPkgEdit]     = useState(null);
  const [pkgSaving, setPkgSaving] = useState(false);
  const [pkgMsg, setPkgMsg]       = useState('');
  /* date/time inputs */
  const [newDate, setNewDate]     = useState('');
  const [newTime, setNewTime]     = useState('');

  useEffect(() => {
    Promise.all([
      adminService.getStats(),
      adminService.getBookings(),
      adminService.getUsers(),
      adminService.getPackages(),
      adminService.getDestinations(),
    ])
      .then(([s, b, u, pk, dest]) => {
        setStats(s.data);
        setBookings(b.data.bookings || b.data || []);
        setUsers(u.data.users || u.data || []);
        setPackages(pk.data.packages || pk.data || []);
        setDestinations(dest.data.destinations || dest.data || []);
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
  const openPkgCreate = () => { setPkgEdit(null); setPkgForm(EMPTY_PKG); setNewDate(''); setNewTime(''); setPkgMsg(''); setPkgModal(true); };
  const openPkgEdit   = (p) => {
    setPkgEdit(p._id);
    setPkgForm({ name: p.name, description: p.description, price: p.price, category: p.category, duration: p.duration, destination: p.destination, image: p.image || '', features: (p.features || []).join(', '), status: p.status || 'active', availableDates: p.availableDates || [], availableTimes: p.availableTimes || [], bookingLimitPerSlot: p.bookingLimitPerSlot || 5 });
    setNewDate(''); setNewTime(''); setPkgMsg(''); setPkgModal(true);
  };
  const closePkg = () => { setPkgModal(false); setPkgMsg(''); };
  const setP = (k) => (e) => setPkgForm((prev) => ({ ...prev, [k]: e.target.value }));

  const addDate = () => { if (newDate && !pkgForm.availableDates.includes(newDate)) { setPkgForm((p) => ({ ...p, availableDates: [...p.availableDates, newDate].sort() })); setNewDate(''); } };
  const removeDate = (d) => setPkgForm((p) => ({ ...p, availableDates: p.availableDates.filter((x) => x !== d) }));
  const addTime = () => { if (newTime && !pkgForm.availableTimes.includes(newTime)) { setPkgForm((p) => ({ ...p, availableTimes: [...p.availableTimes, newTime].sort() })); setNewTime(''); } };
  const removeTime = (t) => setPkgForm((p) => ({ ...p, availableTimes: p.availableTimes.filter((x) => x !== t) }));

  const savePkg = async (e) => {
    e.preventDefault(); setPkgSaving(true); setPkgMsg('');
    const payload = { ...pkgForm, price: parseFloat(pkgForm.price), features: pkgForm.features.split(',').map((s) => s.trim()).filter(Boolean) };
    try {
      if (pkgEdit) {
        const res = await adminService.updatePackage(pkgEdit, payload);
        const updated = res.data.package || res.data;
        setPackages((prev) => prev.map((x) => x._id === pkgEdit ? updated : x));
        setPkgMsg('✅ Package updated!');
      } else {
        const res = await adminService.createPackage(payload);
        const created = res.data.package || res.data;
        setPackages((prev) => [created, ...prev]);
        setPkgMsg('✅ Package created!');
        setPkgForm(EMPTY_PKG);
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

  /* ── Destination helpers ── */
  const openDestCreate = () => { setDestEdit(null); setDestForm(EMPTY_DEST); setDestMsg(''); setDestModal(true); };
  const openDestEdit = (d) => {
    setDestEdit(d._id);
    setDestForm({ name: d.name, city: d.city||'', country: d.country||'', category: d.category, image: d.image||'', tagline: d.tagline||'', description: d.description||'', culturalInfo: d.culturalInfo||'', highlights: (d.highlights||[]).join('\n'), bestTime: d.bestTime||'', avgCost: d.avgCost||'', isActive: d.isActive??true });
    setDestMsg(''); setDestModal(true);
  };
  const closeDest = () => { setDestModal(false); setDestMsg(''); };
  const setD = (k) => (e) => setDestForm((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const saveDest = async (e) => {
    e.preventDefault(); setDestSaving(true); setDestMsg('');
    const payload = { ...destForm, highlights: destForm.highlights.split('\n').map((s) => s.trim()).filter(Boolean) };
    try {
      if (destEdit) {
        const r = await adminService.updateDestination(destEdit, payload);
        setDestinations((p) => p.map((x) => x._id === destEdit ? (r.data.destination || r.data) : x));
        setDestMsg('✅ Updated!');
      } else {
        const r = await adminService.createDestination(payload);
        setDestinations((p) => [r.data.destination || r.data, ...p]);
        setDestMsg('✅ Created!'); setDestForm(EMPTY_DEST);
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
  const toggleDestActive = async (d) => {
    try { const r = await adminService.updateDestination(d._id, { isActive: !d.isActive }); setDestinations((p) => p.map((x) => x._id === d._id ? (r.data.destination || r.data) : x)); }
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
                <i className={`fas ${t==='overview'?'fa-chart-bar':t==='bookings'?'fa-calendar-check':t==='packages'?'fa-box-open':t==='destinations'?'fa-globe':'fa-users'}`} />
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
                          {p.image
                            ? <img src={p.image} alt="" style={{width:56,height:40,objectFit:'cover',borderRadius:6}} onError={(e)=>{e.target.style.display='none'}}/>
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

          {/* ── Destinations ── */}
          {tab === 'destinations' && (
            <div>
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
              <label>Image URL</label>
              <input className="form-input" value={pkgForm.image} onChange={setP('image')} placeholder="https://images.unsplash.com/..."/>
              {pkgForm.image && <img src={pkgForm.image} alt="preview" style={{marginTop:8,width:'100%',height:120,objectFit:'cover',borderRadius:8}} onError={(e)=>e.target.style.display='none'}/>}
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
              <label>Image URL</label>
              <input className="form-input" value={destForm.image} onChange={setD('image')} placeholder="https://images.unsplash.com/..."/>
              {destForm.image && <img src={destForm.image} alt="preview" style={{marginTop:8,width:'100%',height:140,objectFit:'cover',borderRadius:8}} onError={(e)=>e.target.style.display='none'}/>}
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

    </div>
  );
};

export default Admin;
