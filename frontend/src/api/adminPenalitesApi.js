import apiClient from './axiosConfig';

export const adminPenalitesApi = {
  // Tous les prêts actuellement en retard
  getPretsEnRetard: () =>
    apiClient.get('/gestionemprunt/api/emprunts/retards'),

  // Toutes les pénalités impayées (tous utilisateurs confondus)
  getPenalitesImpayees: () =>
    apiClient.get('/gestionpenalite/api/penalites/impayees'),

  // Marquer une pénalité comme payée manuellement
  payerPenalite: (penaliteId, transactionId) =>
    apiClient.put('/gestionpenalite/api/penalites/payer', {
      penaliteId,
      transactionId,
    }),
};