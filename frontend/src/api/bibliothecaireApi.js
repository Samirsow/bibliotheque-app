// api/bibliothecaireApi.js
import apiClient from './axiosConfig';

//  Constantes pour les rôles
const ROLES = {
  MEMBRE: 'ROLE_MEMBRE',
  ADMIN: 'ROLE_ADMIN',
  BIBLIOTHECAIRE: 'ROLE_BIBLIOTHECAIRE'
};

//  Fonction de filtrage réutilisable
const filtrerMembresSimples = (utilisateurs) => {
  if (!Array.isArray(utilisateurs)) return [];
  
  return utilisateurs.filter(user => {
    const roles = user.roles || [];
    // Vérifier que l'utilisateur a le rôle MEMBRE
    const estMembre = roles.includes(ROLES.MEMBRE);
    // Vérifier qu'il n'a PAS les rôles exclus
    const estExclu = roles.some(r => 
      r === ROLES.ADMIN || 
      r === ROLES.BIBLIOTHECAIRE
    );
    return estMembre && !estExclu;
  });
};

export const bibliothecaireApi = {
  // --- Membres (avec filtre) ---
  getMembres: async () => {
    try {
      const response = await apiClient.get('/gestion/api/utilisateurs');
      
      // ✅ Filtrer les utilisateurs
      const membresSimples = filtrerMembresSimples(response.data);
      
      // 📊 Log pour débogage
      console.log(`📊 Total utilisateurs: ${response.data.length}`);
      console.log(`✅ Membres simples: ${membresSimples.length}`);
      console.log('❌ Exclus:', response.data.length - membresSimples.length);
      
      // Retourner les données filtrées
      return {
        ...response,
        data: membresSimples,
        // Ajouter des métadonnées utiles
        metadata: {
          total: response.data.length,
          filtered: membresSimples.length,
          excluded: response.data.length - membresSimples.length
        }
      };
    } catch (error) {
      console.error('❌ Erreur lors du chargement des membres:', error);
      throw error;
    }
  },

  // --- CRUD Membres ---
  creerMembre: (userData, role = ROLES.MEMBRE) =>
    apiClient.post(`/gestion/api/admin/utilisateurs?role=${role}`, userData),
    
  modifierRoleMembre: (id, role) =>
    apiClient.put(`/gestion/api/admin/utilisateurs/${id}/role?role=${role}`),
    
  bloquerMembre: (id) =>
    apiClient.put(`/gestion/api/admin/utilisateurs/${id}/bloquer`),
    
  debloquerMembre: (id) =>
    apiClient.put(`/gestion/api/admin/utilisateurs/${id}/debloquer`),
    
  supprimerMembre: (id) =>
    apiClient.delete(`/gestion/api/admin/utilisateurs/${id}`),

  // --- CRUD Livres ---
  getLivres: () => apiClient.get('/gestionlivre/api/livres'),
  creerLivre: (livre) => apiClient.post('/gestionlivre/api/livres', livre),
  modifierLivre: (id, livre) =>
    apiClient.put(`/gestionlivre/api/livres/${id}`, livre),
  supprimerLivre: (id) =>
    apiClient.delete(`/gestionlivre/api/livres/${id}`),

  // --- Emprunts ---
  getAllEmprunts: () => apiClient.get('/gestionemprunt/api/emprunts'),
  creerEmprunt: (utilisateurId, livreId, dateRetourPrevue) =>
    apiClient.post('/gestionemprunt/api/emprunts', {
      utilisateurId,
      livreId,
      dateRetourPrevue,
    }),

  // --- Retours ---
  validerRetour: (empruntId, dateRetour) => {
    const query = dateRetour ? `?dateRetour=${dateRetour}` : '';
    return apiClient.put(`/gestionemprunt/api/emprunts/retour/${empruntId}${query}`);
  },

  // --- Paiements (pénalités) ---
  getPenalitesImpayees: () =>
    apiClient.get('/gestionpenalite/api/penalites/impayees'),
    
  validerPaiement: (penaliteId, transactionId) =>
    apiClient.put('/gestionpenalite/api/penalites/payer', {
      penaliteId,
      transactionId,
    }),
      //  Demandes en attente - Version corrigée
   getDemandesEnAttente: () => {
    console.log('📤 Appel API: /gestionemprunt/api/emprunts/demandes-en-attente');
    return apiClient.get('/gestionemprunt/api/emprunts/demandes-en-attente')
        .then(response => {
            console.log('📥 Réponse reçue:', response.data);
            return response;
        })
        .catch(error => {
            console.error('❌ Erreur détaillée:', error);
            console.error('❌ Status:', error.response?.status);
            console.error('❌ Message:', error.response?.data);
            throw error;
        });
},
   // Valider un emprunt
validerEmprunt: (id) =>
    apiClient.put(`/gestionemprunt/api/emprunts/${id}/valider`),

//  Refuser un emprunt
refuserEmprunt: (id, motif) =>
    apiClient.put(`/gestionemprunt/api/emprunts/${id}/refuser`, { motif }),

// Créer une demande d'emprunt (membre)
demanderEmprunt: (utilisateurId, livreId, dateRetourPrevue) =>
    apiClient.post('/gestionemprunt/api/emprunts/demande', {
        utilisateurId,
        livreId,
        dateRetourPrevue
    }),
};