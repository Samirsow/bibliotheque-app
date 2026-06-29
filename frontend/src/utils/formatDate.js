export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const isDateExpired = (dateString) => {
  if (!dateString) return false;
  return new Date(dateString) < new Date();
};

export const daysBetween = (date1, date2) => {
  const diff = new Date(date2) - new Date(date1);
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};