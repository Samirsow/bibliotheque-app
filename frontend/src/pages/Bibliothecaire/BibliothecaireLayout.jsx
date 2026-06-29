import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  FaBook,
  FaUsers,
  FaHandshake,
  FaUndo,
  FaMoneyCheckAlt,
  FaSignOutAlt,
} from 'react-icons/fa';

const BibliothecaireLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `nav-link text-white d-flex align-items-center gap-2 py-2 ${
      isActive ? 'bg-primary rounded' : ''
    }`;

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <nav
        className="bg-dark text-white p-3 d-flex flex-column"
        style={{ width: 240, position: 'fixed', height: '100vh' }}
      >
        <div className="mb-4">
          <h5 className="fw-bold mb-0">
            <FaBook className="me-2" />
            Espace Bibliothécaire
          </h5>
          <small className="text-white-50">{user?.email}</small>
        </div>

        <ul className="nav nav-pills flex-column gap-1 flex-grow-1">
          <li className="nav-item">
            <NavLink to="/bibliothecaire/membres" className={linkClass}>
              <FaUsers /> Membres
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/bibliothecaire/livres" className={linkClass}>
              <FaBook /> Livres
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/bibliothecaire/emprunts" className={linkClass}>
              <FaHandshake /> Emprunts
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/bibliothecaire/retours" className={linkClass}>
              <FaUndo /> Retours
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/bibliothecaire/paiements" className={linkClass}>
              <FaMoneyCheckAlt /> Paiements
            </NavLink>
          </li>
        </ul>

        <button
          onClick={handleLogout}
          className="btn btn-outline-light d-flex align-items-center gap-2 justify-content-center"
        >
          <FaSignOutAlt /> Déconnexion
        </button>
      </nav>

      <main className="flex-grow-1 p-4" style={{ marginLeft: 240 }}>
        <Outlet />
      </main>
    </div>
  );
};

export default BibliothecaireLayout;