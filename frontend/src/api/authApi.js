// api/authApi.js
import apiClient from './axiosConfig';

export const authApi = {
  login: (email, motDePasse) => 
    apiClient.post('/gestion/api/auth/login', { email, motDePasse }),
  
  register: (userData) => 
    apiClient.post('/gestion/api/auth/inscription', userData),
  
  getProfile: () => 
    apiClient.get('/gestion/api/utilisateurs/Moi'),
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};