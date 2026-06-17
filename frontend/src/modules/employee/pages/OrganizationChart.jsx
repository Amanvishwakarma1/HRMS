import React from 'react';
import { User, Users, ChevronDown } from 'lucide-react';

const OrganizationChart = () => {
  // Mock hierarchy data
  const orgData = {
    role: "CEO",
    name: "John Doe",
    department: "Executive",
    children: [
      {
        role: "HR Manager",
        name: "Bob Johnson",
        department: "HR",
        children: [{ role: "Recruiter", name: "Sarah Smith", department: "HR" }]
      },
      {
        role: "CTO",
        name: "Alice Smith",
        department: "Engineering",
        children: [
          { role: "Frontend Lead", name: "Mike Ross", department: "Engineering" },
          { role: "Backend Lead", name: "Jane Doe", department: "Engineering" }
        ]
      },
      {
        role: "Sales Director",
        name: "Charlie Davis",
        department: "Sales",
        children: [{ role: "Account Exec", name: "Sam Wilson", department: "Sales" }]
      }
    ]
  };

  const styles = {
    container: { maxWidth: '1200px', margin: '0 auto', padding: '40px', fontFamily: 'system-ui, sans-serif' },
    card: { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', minWidth: '200px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
    nodeWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' },
    childrenWrapper: { display: 'flex', gap: '20px', marginTop: '20px' },
    line: { width: '2px', height: '20px', backgroundColor: '#cbd5e1' }
  };

  const renderNode = (node) => (
    <div key={node.name} style={styles.nodeWrapper}>
      <div style={styles.card}>
        <User size={32} color="#0ea5e9" style={{ marginBottom: '8px' }} />
        <h3 style={{ margin: '0', fontSize: '16px' }}>{node.name}</h3>
        <p style={{ margin: '4px 0', fontSize: '14px', color: '#64748b' }}>{node.role}</p>
        <span style={{ fontSize: '12px', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>{node.department}</span>
      </div>
      
      {node.children && (
        <>
          <div style={styles.line}></div>
          <div style={styles.childrenWrapper}>
            {node.children.map(child => renderNode(child))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div style={styles.container}>
      <h1 style={{ fontSize: '28px', marginBottom: '40px', textAlign: 'center' }}>Company Structure</h1>
      {renderNode(orgData)}
    </div>
  );
};

export default OrganizationChart;