// App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import './App.css';
import './styles/theme.css';

// Components
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Footer from './components/Layout/Footer';

// Bibliothécaire
import Membres from './Pages/Bibliothecaire/Membres';
import LivresGestion from './Pages/Bibliothecaire/LivresGestion';
import EmpruntsGestion from './Pages/Bibliothecaire/EmpruntsGestion';
import Retours from './Pages/Bibliothecaire/Retours';
import Paiements from './Pages/Bibliothecaire/Paiement';

// Auth
import Login from './Pages/Auth/Login';
import Register from './Pages/Auth/Register';
import PrivateRoute from './Pages/Auth/PrivateRoute';

import Profile from './pages/Admin/Profile.jsx';

import DemandesEnAttente from './Pages/Bibliothecaire/DemandesEnAttente';

// Pages
import Dashboard from './components/Dashboard/Dashboard';
import ListeLivres from './Pages/Livres/ListeLivres';
import LivreDetail from './Pages/Livres/LivreDetail';
import AjouterLivre from './Pages/Livres/AjouterLivre';
import MesEmprunts from './Pages/Emprunts/MesEmprunts';
import NouvelEmprunt from './Pages/Emprunts/NouvelEmprunt';
import MesPenalites from './Pages/Penalites/MesPenalites';
import MesNotifications from './Pages/Notifications/MesNotifications';
import AdminUtilisateurs from './Pages/Admin/AdminUtilisateur';
import AdminRetards from './Pages/Admin/AdminRetards';

import ModifierLivre from './Pages/Livres/ModifierLivre';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="app">
      <Navbar />
      <div className="app-body d-flex">
        {isAuthenticated && <Sidebar />}
        <main className="main-content flex-grow-1 p-4">
          <Routes>
            {/* Pages publiques */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Bibliothécaire */}
            <Route path="/bibliothecaire/membres" element={<PrivateRoute><Membres /></PrivateRoute>} />
            <Route path="/bibliothecaire/livres" element={<PrivateRoute><LivresGestion /></PrivateRoute>} />
            <Route path="/bibliothecaire/emprunts" element={<PrivateRoute><EmpruntsGestion /></PrivateRoute>} />
            <Route path="/bibliothecaire/retours" element={<PrivateRoute><Retours /></PrivateRoute>} />
            <Route path="/bibliothecaire/paiements" element={<PrivateRoute><Paiements /></PrivateRoute>} />

            <Route path="/bibliothecaire/demandes" element={<PrivateRoute><DemandesEnAttente /></PrivateRoute>} />


            {/* Pages protégées */}
            <Route path="/" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />

               

            {/* Admin */}
            <Route
              path="/admin/retards"
              element={
                <PrivateRoute adminOnly>
                  <AdminRetards />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/utilisateurs"
              element={
                <PrivateRoute adminOnly>
                  <AdminUtilisateurs />
                </PrivateRoute>
              }
            />

             {/* ✅ Route Protégée pour le Profil */}
            <Route 
              path="/profile" 
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } 
            />

            {/* Livres */}
            <Route path="/livres" element={
              <PrivateRoute>
                <ListeLivres />
              </PrivateRoute>
            } />
            <Route path="/livres/:id" element={
              <PrivateRoute>
                <LivreDetail />
              </PrivateRoute>
            } />
            <Route path="/livres/ajouter" element={
              <PrivateRoute adminOnly>
                <AjouterLivre />
              </PrivateRoute>
            } />

            <Route path="/livres/edit/:id" element={
              <PrivateRoute adminOnly>
                <ModifierLivre />
              </PrivateRoute>
            } />

            {/* Emprunts */}
            <Route path="/emprunts" element={
              <PrivateRoute>
                <MesEmprunts />
              </PrivateRoute>
            } />
            <Route path="/emprunts/nouveau" element={
              <PrivateRoute>
                <NouvelEmprunt />
              </PrivateRoute>
            } />

            {/* Pénalités */}
            <Route path="/penalites" element={
              <PrivateRoute>
                <MesPenalites />
              </PrivateRoute>
            } />

            {/* Notifications */}
            <Route path="/notifications" element={
              <PrivateRoute>
                <MesNotifications />
              </PrivateRoute>
            } />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default App;