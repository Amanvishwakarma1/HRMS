import React, { useState } from 'react';

const LeaveForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    type: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if(onSubmit) onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Add your form inputs (select type, date pickers, text area) here */}
      <button type="submit" className="bg-blue-600 text-white p-2 rounded">
        Submit Application
      </button>
    </form>
  );
};

export default LeaveForm;