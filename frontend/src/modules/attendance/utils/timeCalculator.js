/**
 * Calculates working hours between two timestamps safely
 * @param {string|Date} checkInTime 
 * @param {string|Date} checkOutTime 
 * @returns {string} Formatted duration string (HH:mm:ss)
 */
export const calculateWorkingHours = (checkInTime, checkOutTime) => {
  if (!checkInTime || checkInTime === '--:--:--' || checkInTime === '--:--') return '00:00:00';
  
  const parseTimeToMs = (timeVal) => {
    if (timeVal instanceof Date) return timeVal.getTime();
    if (typeof timeVal === 'string') {
      if (timeVal.includes('T')) return new Date(timeVal).getTime();
      
      const parts = timeVal.split(':');
      const hrs = parseInt(parts[0], 10) || 0;
      const mins = parseInt(parts[1], 10) || 0;
      const secs = parseInt(parts[2], 10) || 0;
      
      const reference = new Date();
      reference.setHours(hrs, mins, secs, 0);
      return reference.getTime();
    }
    return Date.now();
  };

  try {
    const startTime = parseTimeToMs(checkInTime);
    const endTime = checkOutTime && checkOutTime !== '--:--:--' && checkOutTime !== '--:--' 
      ? parseTimeToMs(checkOutTime) 
      : Date.now();

    const diffMs = Math.max(0, endTime - startTime);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffMins = Math.floor((diffMs % 3600000) / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);

    return [
      String(diffHrs).padStart(2, '0'),
      String(diffMins).padStart(2, '0'),
      String(diffSecs).padStart(2, '0')
    ].join(':');
  } catch (error) {
    console.error("Error calculating working hours:", error);
    return '00:00:00';
  }
};

/**
 * Formats a given date/time string into an operational format (HH:mm:ss)
 * @param {string|Date} dateString 
 * @returns {string} Formatted operational string
 */
export const formatTimeShort = (dateString) => {
  if (!dateString || dateString === '--:--:--' || dateString === '--:--') return '--:--:--';
  
  if (typeof dateString === 'string' && !dateString.includes('T') && dateString.split(':').length >= 2) {
    return dateString;
  }

  let date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: false 
  });
};