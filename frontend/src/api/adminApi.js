import apiClient from './axiosConfig';

export const adminApi = {
  // Créer un utilisateur avec un rôle spécifique
  creerUtilisateur: (userData, role) =>
    apiClient.post(`/gestion/api/admin/utilisateurs?role=${role}`, userData),

  // Récupérer tous les utilisateurs (utilise l'endpoint existant /api/utilisateurs)
  getAllUtilisateurs: () =>
    apiClient.get('/gestion/api/utilisateurs'),
  
   modifierUtilisateur: (id, data) =>
    apiClient.put(`/gestion/api/admin/utilisateurs/${id}`, data),

  // Bloquer un utilisateur
  bloquerUtilisateur: (id) =>
    apiClient.put(`/gestion/api/admin/utilisateurs/${id}/bloquer`),

  // Débloquer un utilisateur
  debloquerUtilisateur: (id) =>
    apiClient.put(`/gestion/api/admin/utilisateurs/${id}/debloquer`),

  // Modifier le rôle d'un utilisateur
  modifierRole: (id, role) =>
    apiClient.put(`/gestion/api/admin/utilisateurs/${id}/role?role=${role}`),

  // Supprimer (bloquer) un utilisateur
  supprimerUtilisateur: (id) =>
    apiClient.delete(`/gestion/api/admin/utilisateurs/${id}`),
};