
export const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  export const formatDateForAPI = (date) => {
    if (!date) return null;
    
    return date.toISOString().slice(0, 19);
  };