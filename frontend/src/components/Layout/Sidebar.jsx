import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  FaHome,
  FaBook,
  FaHandshake,
  FaMoneyBillWave,
  FaBell,
  FaPlus,
  FaUsers,
  FaExclamationTriangle,
  FaUndo,
  FaMoneyCheckAlt,
  FaUserShield,
} from 'react-icons/fa';

const Sidebar = () => {
  const { isAdmin, isBibliothecaire } = useAuth();

  // --- Sidebar dédiée à l'administrateur ---
  if (isAdmin()) {
    return (
      <div
        className="sidebar bg-dark text-white vh-100 p-3"
        style={{ width: '250px', position: 'fixed', top: '56px', overflowY: 'auto' }}
      >
        <p className="text-white-50 text-uppercase small fw-bold mb-3 ps-2">
          Espace Administrateur
        </p>
        <ul className="nav flex-column">
          <li className="nav-item">
            <NavLink className="nav-link text-white" to="/dashboard">
              <FaHome className="me-2" /> Dashboard
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link text-white" to="/admin/utilisateurs">
              <FaUsers className="me-2" /> Utilisateurs
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link text-white" to="/admin/retards">
              <FaExclamationTriangle className="me-2" /> Retards &amp; pénalités
            </NavLink>
          </li>
        </ul>
      </div>
    );
  }

  // --- Sidebar dédiée au bibliothécaire ---
  if (isBibliothecaire()) {
    return (
      <div
        className="sidebar bg-dark text-white vh-100 p-3"
        style={{ width: '250px', position: 'fixed', top: '56px', overflowY: 'auto' }}
      >
        <p className="text-white-50 text-uppercase small fw-bold mb-3 ps-2">
          Espace Bibliothécaire
        </p>
        <ul className="nav flex-column">
          <li className="nav-item">
            <NavLink className="nav-link text-white" to="/dashboard">
              <FaHome className="me-2" /> Dashboard
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link text-white" to="/bibliothecaire/membres">
              <FaUsers className="me-2" /> Membres
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link text-white" to="/bibliothecaire/livres">
              <FaBook className="me-2" /> Livres
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link text-white" to="/bibliothecaire/emprunts">
              <FaHandshake className="me-2" /> Emprunts
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link text-white" to="/bibliothecaire/retours">
              <FaUndo className="me-2" /> Retours
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link text-white" to="/bibliothecaire/paiements">
              <FaMoneyCheckAlt className="me-2" /> Paiements
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink className="nav-link text-white" to="/bibliothecaire/demandes">
              <FaMoneyCheckAlt className="me-2" /> liste des demandes
            </NavLink>
          </li>
        </ul>
      </div>
    );
  }

  // --- Sidebar par défaut (membre) ---
  return (
    <div
      className="sidebar bg-dark text-white vh-100 p-3"
      style={{ width: '250px', position: 'fixed', top: '56px', overflowY: 'auto' }}
    >
      <ul className="nav flex-column">
        <li className="nav-item">
          <NavLink className="nav-link text-white" to="/dashboard">
            <FaHome className="me-2" /> Tableau de bord
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link text-white" to="/livres">
            <FaBook className="me-2" /> Livres
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link text-white" to="/emprunts">
            <FaHandshake className="me-2" /> Mes Emprunts
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link text-white" to="/penalites">
            <FaMoneyBillWave className="me-2" /> Pénalités
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link text-white" to="/notifications">
            <FaBell className="me-2" /> Notifications
          </NavLink>
        </li>
       
      </ul>
    </div>
  );
};

export default Sidebar;