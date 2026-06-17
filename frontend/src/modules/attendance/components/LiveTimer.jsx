import React, { useState, useEffect } from 'react';
import { calculateWorkingHours } from '../utils/timeCalculator';

export const LiveTimer = ({ startTime, endTime }) => {
  const [displayTime, setDisplayTime] = useState('00:00:00');

  useEffect(() => {
    if (!startTime) {
      setDisplayTime('00:00:00');
      return;
    }

    if (endTime) {
      setDisplayTime(calculateWorkingHours(startTime, endTime));
      return;
    }

    setDisplayTime(calculateWorkingHours(startTime, null));

    const ticker = setInterval(() => {
      setDisplayTime(calculateWorkingHours(startTime, null));
    }, 1000);

    return () => clearInterval(ticker);
  }, [startTime, endTime]);

  return <span className="text-3xl font-extrabold font-mono text-white tracking-tight">{displayTime}</span>;
};