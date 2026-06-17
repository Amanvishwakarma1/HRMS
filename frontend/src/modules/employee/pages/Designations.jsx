import React, { useState, useEffect, useRef } from 'react';
import { 
  BriefcaseBusiness, Users, Plus, Search, 
  MoreVertical, X, Edit2, Trash2, Award 
} from 'lucide-react';

const Designations = () => {
  const [designations, setDesignations] = useState([
    { id: 'DES-001', title: 'Frontend Developer', department: 'Engineering', totalStaff: 12, level: 'Mid-Level' },
    { id: 'DES-002', title: 'HR Manager', department: 'Human Resources', totalStaff: 2, level: 'Senior' },
    { id: 'DES-003', title: 'Sales Lead', department: 'Sales & Marketing', totalStaff: 5, level: 'Senior' },
    { id: 'DES-004', title: 'Financial Analyst', department: 'Finance', totalStaff: 4, level: 'Entry' },
    { id: 'DES-005', title: 'Support Specialist', department: 'Customer Support', totalStaff: 15, level: 'Entry' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', department: '', totalStaff: '', level: '' });
  
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (id, e) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this designation?")) {
      setDesignations(designations.filter(d => d.id !== id));
      setActiveDropdown(null);
    }
  };

  const handleEditClick = (des) => {
    setFormData({ title: des.title, department: des.department, totalStaff: des.totalStaff, level: des.level });
    setEditingId(des.id);
    setIsModalOpen(true);
    setActiveDropdown(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ title: '', department: '', totalStaff: '', level: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      setDesignations(designations.map(d => d.id === editingId ? { ...d, ...formData } : d));
    } else {
      const newDes = { id: `DES-00${designations.length + 1}`, ...formData };
      setDesignations([...designations, newDes]);
    }
    closeModal();
  };

  const filtered = designations.filter(d => d.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const styles = {
    container: { maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif', paddingBottom: '40px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' },
    addBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' },
    statCard: { backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '20px' },
    statIcon: (bg, color) => ({ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }),
    contentCard: { backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'visible' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    th: { padding: '16px 24px', backgroundColor: '#f8fafc', color: '#475569', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' },
    td: { padding: '16px 24px', borderBottom: '1px solid #f1f5f9', color: '#334155', fontSize: '14px', position: 'relative' },
    modalOverlay: { position: 'fixed', top:0, left:0, right:0, bottom:0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    modalContent: { backgroundColor: '#fff', padding: '32px', borderRadius: '20px', width: '450px', position: 'relative' },
    input: { width: '100%', padding: '12px', margin: '8px 0 16px 0', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div><h1 style={{fontSize:'28px', margin:0}}>Designations</h1><p style={{color:'#64748b'}}>Manage roles and professional levels.</p></div>
        <button style={styles.addBtn} onClick={() => setIsModalOpen(true)}><Plus size={18} /> Add Role</button>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}><div style={styles.statIcon('#ede9fe', '#8b5cf6')}><BriefcaseBusiness size={24}/></div><div><p style={{margin:0, fontSize:24, fontWeight:'bold'}}>{designations.length}</p><p style={{margin:0, color:'#64748b'}}>Active Roles</p></div></div>
        <div style={styles.statCard}><div style={styles.statIcon('#e0f2fe', '#0ea5e9')}><Users size={24}/></div><div><p style={{margin:0, fontSize:24, fontWeight:'bold'}}>{designations.reduce((s,d)=>s+parseInt(d.totalStaff),0)}</p><p style={{margin:0, color:'#64748b'}}>Total Employees</p></div></div>
        <div style={styles.statCard}><div style={styles.statIcon('#fef3c7', '#d97706')}><Award size={24}/></div><div><p style={{margin:0, fontSize:24, fontWeight:'bold'}}>Hierarchy</p><p style={{margin:0, color:'#64748b'}}>Multi-level</p></div></div>
      </div>

      <div style={styles.contentCard}>
        <div style={{padding: '20px'}}><input style={{...styles.input, marginBottom:0, paddingLeft:40}} placeholder="Search roles..." onChange={(e) => setSearchTerm(e.target.value)} /></div>
        <table style={styles.table}>
          <thead><tr><th style={styles.th}>ID</th><th style={styles.th}>Title</th><th style={styles.th}>Department</th><th style={styles.th}>Total Staff</th><th style={styles.th}>Level</th><th style={styles.th}>Actions</th></tr></thead>
          <tbody>
            {filtered.map(d => (
              <tr key={d.id}>
                <td style={styles.td}>{d.id}</td>
                <td style={styles.td}><strong style={{color:'#1e293b'}}>{d.title}</strong></td>
                <td style={styles.td}>{d.department}</td>
                <td style={styles.td}>{d.totalStaff}</td>
                <td style={styles.td}><span style={{padding:'4px 10px', borderRadius:'6px', backgroundColor:'#f1f5f9', fontSize:12, fontWeight:600}}>{d.level}</span></td>
                <td style={styles.td}>
                  <button onClick={(e) => toggleDropdown(d.id, e)} style={{background:'none', border:'none', cursor:'pointer'}}><MoreVertical size={16}/></button>
                  {activeDropdown === d.id && (
                    <div ref={dropdownRef} style={{position:'absolute', right:'40px', backgroundColor:'#fff', border:'1px solid #e2e8f0', padding:'5px', zIndex:10, borderRadius:'8px', boxShadow:'0 10px 15px -3px rgba(0,0,0,0.1)'}}>
                      <button style={{display:'block', width:'120px', border:'none', padding:'8px 12px', background:'none', cursor:'pointer', textAlign:'left'}} onClick={() => handleEditClick(d)}><Edit2 size={14} style={{marginRight:8}}/>Edit</button>
                      <button style={{display:'block', width:'120px', border:'none', padding:'8px 12px', background:'none', cursor:'pointer', color:'red', textAlign:'left'}} onClick={() => handleDelete(d.id)}><Trash2 size={14} style={{marginRight:8}}/>Delete</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h2 style={{marginTop:0}}>{editingId ? 'Edit' : 'Add'} Designation</h2>
            <form onSubmit={handleSubmit}>
              <label>Title</label><input style={styles.input} required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              <label>Department</label><input style={styles.input} required value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
              <label>Total Staff</label><input style={styles.input} required type="number" value={formData.totalStaff} onChange={e => setFormData({...formData, totalStaff: e.target.value})} />
              <label>Level</label><input style={styles.input} required value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})} />
              <button type="submit" style={{...styles.addBtn, width:'100%', justifyContent:'center', padding:14, backgroundColor:'#8b5cf6'}}>Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Designations;