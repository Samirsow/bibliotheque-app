import apiClient from './axiosConfig';

export const notificationApi = {
  getAll: () => 
    apiClient.get('/gestionnotification/api/notifications'),
  
  getByUtilisateur: (utilisateurId) => 
    apiClient.get(`/gestionnotification/api/notifications/utilisateur/${utilisateurId}`),
  
  envoyer: (data) => 
    apiClient.post('/gestionnotification/api/notifications', data),
  
  supprimer: (id) => 
    apiClient.delete(`/gestionnotification/api/notifications/${id}`),
  
  supprimerAllByUtilisateur: (utilisateurId) => 
    apiClient.delete(`/gestionnotification/api/notifications/utilisateur/${utilisateurId}`)
};