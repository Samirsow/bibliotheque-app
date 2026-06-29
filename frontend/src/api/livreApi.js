// api/livreApi.js
import apiClient from './axiosConfig';

export const livreApi = {
  getAll: () => 
    apiClient.get('/gestionlivre/api/livres'),
  
  getById: (id) => 
    apiClient.get(`/gestionlivre/api/livres/${id}`),
  
  getDisponibles: () => 
    apiClient.get('/gestionlivre/api/livres/disponibles'),
  
  rechercher: (params) => 
    apiClient.get('/gestionlivre/api/livres/recherche', { params }),
  
  create: (data) => 
    apiClient.post('/gestionlivre/api/livres', data),
  
  update: (id, data) => 
    apiClient.put(`/gestionlivre/api/livres/${id}`, data),
  
  delete: (id) => 
    apiClient.delete(`/gestionlivre/api/livres/${id}`),
  
  verifierDisponibilite: (id) => 
    apiClient.get(`/gestionlivre/api/livres/${id}/disponible`),
  
  getStatistiques: () => 
    apiClient.get('/gestionlivre/api/livres/statistiques')
};