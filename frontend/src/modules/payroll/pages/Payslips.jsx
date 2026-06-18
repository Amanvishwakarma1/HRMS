import React from 'react';
import PayslipCard from '../components/PayslipCard';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../auth/AuthContext'; // assuming auth context exists

const fetchPayslips = async (employeeId) => {
  const response = await axios.get(`/api/payroll/records?employeeId=${employeeId}`);
  return response.data;
};

const Payslips = () => {
  const { user } = useAuth(); // user contains id
  const { data, isLoading, isError } = useQuery(['payslips', user?.id], () => fetchPayslips(user.id), {
    enabled: !!user?.id,
  });

  const handleDownload = (recordId) => {
    // Open payslip HTML in new tab/window
    window.open(`/api/payroll/records/${recordId}/html`, '_blank');
  };

  if (isLoading) return <div>Loading payslips...</div>;
  if (isError) return <div>Error loading payslips.</div>;

  return (
    <div>
      <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>My Payslips</h2>
      <div style={{ display: 'grid', gap: '16px' }}>
        {data && data.length > 0 ? (
          data.map((rec) => (
            <PayslipCard
              key={rec.id}
              month={rec.month}
              netPay={rec.netPay?.toLocaleString()}
              status={rec.status}
              onDownload={() => handleDownload(rec.id)}
            />
          ))
        ) : (
          <p>No payslip records found.</p>
        )}
      </div>
    </div>
  );
};

export default Payslips;