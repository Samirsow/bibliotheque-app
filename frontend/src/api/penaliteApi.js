// api/penaliteApi.js
import apiClient from './axiosConfig';

export const penaliteApi = {
  getAll: () => 
    apiClient.get('/gestionpenalite/api/penalites'),
  
  getByUtilisateur: (utilisateurId) => 
    apiClient.get(`/gestionpenalite/api/penalites/utilisateur/${utilisateurId}`),
  
  getImpayeesByUtilisateur: (utilisateurId) => 
    apiClient.get(`/gestionpenalite/api/penalites/utilisateur/${utilisateurId}/impayees`),
  
  getTotalImpaye: (utilisateurId) => 
    apiClient.get(`/gestionpenalite/api/penalites/utilisateur/${utilisateurId}/total`),
  
  calculer: (joursRetard) => 
    apiClient.post(`/gestionpenalite/api/penalites/calculer?joursRetard=${joursRetard}`),
  
  create: (data) => 
    apiClient.post('/gestionpenalite/api/penalites', data),
  
  payer: (data) => 
    apiClient.put('/gestionpenalite/api/penalites/payer', data)
};