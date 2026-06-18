import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, Users, Briefcase, Plus, Search, 
  MoreVertical, X, Edit2, Trash2 
} from 'lucide-react';

const Departments = () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || { role: 'employee' };
  const isEmployee = currentUser.role === 'employee';

  const [departments, setDepartments] = useState([
    { id: 'DEPT-01', name: 'Engineering', head: 'Alice Smith', employees: 42, status: 'Active', budget: '4.5' },
    { id: 'DEPT-02', name: 'Human Resources', head: 'Bob Johnson', employees: 8, status: 'Active', budget: '1.2' },
    { id: 'DEPT-03', name: 'Sales & Marketing', head: 'Charlie Davis', employees: 24, status: 'Active', budget: '3.0' },
    { id: 'DEPT-04', name: 'Finance', head: 'Diana Prince', employees: 12, status: 'Active', budget: '2.1' },
    { id: 'DEPT-05', name: 'Customer Support', head: 'Evan Wright', employees: 35, status: 'Active', budget: '1.8' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [editingId, setEditingId] = useState(null); 
  const [formData, setFormData] = useState({ name: '', head: '', employees: '', status: 'Active', budget: '' });
  
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalEmployees = departments.reduce((sum, dept) => sum + parseInt(dept.employees || 0), 0);
  const totalBudget = departments.reduce((sum, dept) => sum + parseFloat(dept.budget || 0), 0).toFixed(1);

  const toggleDropdown = (id, e) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure?")) {
      setDepartments(departments.filter(dept => dept.id !== id));
      setActiveDropdown(null);
    }
  };

  const handleEditClick = (dept) => {
    setFormData({ name: dept.name, head: dept.head, employees: dept.employees, status: dept.status, budget: dept.budget });
    setEditingId(dept.id);
    setIsModalOpen(true);
    setActiveDropdown(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', head: '', employees: '', status: 'Active', budget: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      setDepartments(departments.map(dept => dept.id === editingId ? { ...dept, ...formData } : dept));
    } else {
      const newDept = { id: `DEPT-0${departments.length + 1}`, ...formData };
      setDepartments([...departments, newDept]);
    }
    closeModal();
  };

  const filtered = departments.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const styles = {
    container: { maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif', paddingBottom: '40px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' },
    addBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#0ea5e9', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(14, 165, 233, 0.25)' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' },
    statCard: { background: 'linear-gradient(to bottom, rgba(213, 222, 231, 0.75) 0%, rgba(232, 235, 242, 0.75) 50%, rgba(226, 231, 237, 0.75) 100%), linear-gradient(to bottom, rgba(0,0,0,0.02) 50%, rgba(255,255,255,0.02) 61%, rgba(0,0,0,0.02) 73%), linear-gradient(33deg, rgba(255,255,255,0.20) 0%, rgba(0,0,0,0.20) 100%)', backgroundBlendMode: 'normal,color-burn', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.45)', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' },
    statIcon: (bg, color) => ({ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }),
    contentCard: { background: 'linear-gradient(to bottom, rgba(213, 222, 231, 0.75) 0%, rgba(232, 235, 242, 0.75) 50%, rgba(226, 231, 237, 0.75) 100%), linear-gradient(to bottom, rgba(0,0,0,0.02) 50%, rgba(255,255,255,0.02) 61%, rgba(0,0,0,0.02) 73%), linear-gradient(33deg, rgba(255,255,255,0.20) 0%, rgba(0,0,0,0.20) 100%)', backgroundBlendMode: 'normal,color-burn', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.45)', overflow: 'visible', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    th: { padding: '16px 24px', backgroundColor: 'rgba(15, 23, 42, 0.05)', color: '#0f172a', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', borderBottom: '1px solid rgba(15, 23, 42, 0.08)' },
    td: { padding: '16px 24px', borderBottom: '1px solid rgba(15, 23, 42, 0.08)', color: '#334155', fontSize: '14px', position: 'relative' },
    modalOverlay: { position: 'fixed', top:0, left:0, right:0, bottom:0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    modalContent: { background: 'linear-gradient(to bottom, rgba(213, 222, 231, 0.75) 0%, rgba(232, 235, 242, 0.75) 50%, rgba(226, 231, 237, 0.75) 100%), linear-gradient(to bottom, rgba(0,0,0,0.02) 50%, rgba(255,255,255,0.02) 61%, rgba(0,0,0,0.02) 73%), linear-gradient(33deg, rgba(255,255,255,0.20) 0%, rgba(0,0,0,0.20) 100%)', backgroundBlendMode: 'normal,color-burn', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', padding: '32px', borderRadius: '20px', width: '450px', position: 'relative', border: '1px solid rgba(255, 255, 255, 0.45)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)' },
    input: { width: '100%', padding: '12px', margin: '8px 0 16px 0', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div><h1 style={{fontSize:'28px', margin:0}}>Departments</h1><p style={{color:'#64748b'}}>Manage structure and heads.</p></div>
        {!isEmployee && <button style={styles.addBtn} onClick={() => setIsModalOpen(true)}><Plus size={18} /> Add Department</button>}
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}><div style={styles.statIcon('#e0f2fe', '#0ea5e9')}><Building2 size={24}/></div><div><p style={{margin:0, fontSize:24, fontWeight:'bold'}}>{departments.length}</p><p style={{margin:0, color:'#64748b'}}>Total Depts</p></div></div>
        <div style={styles.statCard}><div style={styles.statIcon('#dcfce7', '#10b981')}><Users size={24}/></div><div><p style={{margin:0, fontSize:24, fontWeight:'bold'}}>{totalEmployees}</p><p style={{margin:0, color:'#64748b'}}>Employees</p></div></div>
        <div style={styles.statCard}><div style={styles.statIcon('#f3e8ff', '#a855f7')}><Briefcase size={24}/></div><div><p style={{margin:0, fontSize:24, fontWeight:'bold'}}>₹{totalBudget}M</p><p style={{margin:0, color:'#64748b'}}>Total Budget</p></div></div>
      </div>

      <div style={styles.contentCard}>
        <div style={{padding: '20px'}}><input style={{...styles.input, marginBottom: 0, paddingLeft: 40}} placeholder="Search departments..." onChange={(e) => setSearchTerm(e.target.value)} /></div>
        <table style={styles.table}>
          <thead><tr><th style={styles.th}>ID</th><th style={styles.th}>Name</th><th style={styles.th}>Head</th><th style={styles.th}>Employees</th><th style={styles.th}>Status</th><th style={styles.th}>Budget (M)</th>{!isEmployee && <th style={styles.th}>Actions</th>}</tr></thead>
          <tbody>
            {filtered.map(d => (
              <tr key={d.id}>
                <td style={styles.td}>{d.id}</td>
                <td style={styles.td}>{d.name}</td>
                <td style={styles.td}>{d.head}</td>
                <td style={styles.td}>{d.employees}</td>
                <td style={styles.td}><span style={{padding:'4px 10px', borderRadius:'20px', backgroundColor:'#d1fae5', color:'#059669', fontSize:12, fontWeight:600}}>{d.status}</span></td>
                <td style={styles.td}>₹{d.budget}</td>
                {!isEmployee && (
                  <td style={styles.td}>
                    <button onClick={(e) => toggleDropdown(d.id, e)} style={{background:'none', border:'none', cursor:'pointer'}}><MoreVertical size={16}/></button>
                    {activeDropdown === d.id && (
                      <div ref={dropdownRef} style={{position:'absolute', right: '40px', background: 'linear-gradient(to bottom, rgba(213, 222, 231, 0.95) 0%, rgba(232, 235, 242, 0.95) 50%, rgba(226, 231, 237, 0.95) 100%)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.5)', padding:'5px', zIndex:10, borderRadius:'8px', boxShadow:'0 10px 15px -3px rgba(0,0,0,0.1)'}}>
                        <button style={{display:'block', width:'120px', border:'none', padding:'8px 12px', background:'none', cursor:'pointer', textAlign:'left'}} onClick={() => handleEditClick(d)}><Edit2 size={14} style={{marginRight:8}}/>Edit</button>
                        <button style={{display:'block', width:'120px', border:'none', padding:'8px 12px', background:'none', cursor:'pointer', color:'red', textAlign:'left'}} onClick={() => handleDelete(d.id)}><Trash2 size={14} style={{marginRight:8}}/>Delete</button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h2 style={{marginTop:0}}>{editingId ? 'Edit' : 'Add'} Department</h2>
            <form onSubmit={handleSubmit}>
              <label>Name</label><input style={styles.input} required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <label>Head</label><input style={styles.input} required value={formData.head} onChange={e => setFormData({...formData, head: e.target.value})} />
              <label>Employees</label><input style={styles.input} required value={formData.employees} onChange={e => setFormData({...formData, employees: e.target.value})} />
              <label>Budget</label><input style={styles.input} required value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} />
              <button type="submit" style={{...styles.addBtn, width:'100%', justifyContent:'center', padding:14}}>Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;