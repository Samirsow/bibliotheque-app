export const API_BASE_URL = 'http://localhost:8888/api';

export const ROLES = {
  ADMIN: 'ROLE_ADMIN',
  BIBLIOTHECAIRE: 'ROLE_BIBLIOTHECAIRE',
  MEMBRE: 'ROLE_MEMBRE'
};

export const STATUTS = {
  EMPRUNT: {
    EN_COURS: 'EN_COURS',
    RETOURNE: 'RETOURNE',
    EN_RETARD: 'EN_RETARD'
  },
  PENALITE: {
    IMPAYE: 'IMPAYE',
    PAYE: 'PAYE',
    ANNULE: 'ANNULE'
  },
  NOTIFICATION: {
    EN_ATTENTE: 'EN_ATTENTE',
    ENVOYEE: 'ENVOYEE',
    ECHEC: 'ECHEC'
  }
};