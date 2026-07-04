// components/Layout/Navbar.js
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FaBook, FaSignOutAlt, FaUser, FaBell, FaHome } from 'react-icons/fa';
import { notificationApi } from '../../api/notificationApi';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isBibliothecaire, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOuvert, setMenuOuvert] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    setMenuOuvert(false);
    logout();
    navigate('/login');
  };

  // Ferme le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOuvert(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const admin = isAdmin();
  const bibliothecaire = !admin && isBibliothecaire();

  const [notificationsCount, setNotificationsCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotificationsCount();
    }
  }, [isAuthenticated, user]);

  const fetchNotificationsCount = async () => {
    try {
      const response = await notificationApi.getByUtilisateur(user.id);
      // Compter les notifications non lues ou en attente
      const unreadCount = response.data.filter(
        notif => notif.statut === 'EN_ATTENTE' || !notif.lu
      ).length;
      setNotificationsCount(unreadCount);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    }
  };

  // ✅ Le lien de la marque redirige vers le Dashboard pour tout le monde
  const brandLink = '/dashboard';

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
      <div className="container-fluid">
        <Link className="navbar-brand" to={brandLink}>
          <FaBook className="me-2" />
          Bibliothèque
          {admin && <span className="badge bg-danger ms-2">Admin</span>}
          {bibliothecaire && <span className="badge bg-primary ms-2">Bibliothécaire</span>}
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          {isAuthenticated ? (
            <>
              {admin ? (
                <ul className="navbar-nav me-auto">
                  {/*  Ajout du Dashboard pour l'admin */}
                  <li className="nav-item">
                    <Link className="nav-link" to="/dashboard">
                      <FaHome className="me-1" /> Dashboard
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/admin/utilisateurs">Utilisateurs</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/admin/retards">Retards &amp; pénalités</Link>
                  </li>
                </ul>
              ) : bibliothecaire ? (
                <ul className="navbar-nav me-auto">
                  {/*  Ajout du Dashboard pour le bibliothécaire */}
                  <li className="nav-item">
                    <Link className="nav-link" to="/dashboard">
                      <FaHome className="me-1" /> Dashboard
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/bibliothecaire/membres">Membres</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/bibliothecaire/livres">Livres</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/bibliothecaire/emprunts">Emprunts</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/bibliothecaire/retours">Retours</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/bibliothecaire/paiements">Paiements</Link>
                  </li>
                </ul>
              ) : (
                <ul className="navbar-nav me-auto">
                  <li className="nav-item">
                    <Link className="nav-link" to="/dashboard">Dashboard</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/livres">Livres</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/emprunts">Mes Emprunts</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/penalites">Pénalités</Link>
                  </li>
                 <li className="nav-item position-relative">
                  <Link className="nav-link" to="/notifications">
                    <FaBell />
                    {notificationsCount > 0 && (
                      <span className="badge bg-danger ms-1">
                        {notificationsCount}
                      </span>
                    )}
                  </Link>
                </li>
                </ul>
              )}

              {/* Menu utilisateur */}
              <ul className="navbar-nav">
                <li className="nav-item position-relative" ref={menuRef}>
                  <button
                    type="button"
                    className="nav-link btn btn-link d-flex align-items-center gap-1 border-0"
                    onClick={() => setMenuOuvert((v) => !v)}
                  >
                    <FaUser className="me-1" />
                    {user?.email || 'Utilisateur'}
                  </button>

                  {menuOuvert && (
                    <ul
                      className="dropdown-menu dropdown-menu-end show"
                      style={{ position: 'absolute', right: 0, top: '100%' }}
                    >
                      <li>
                        <Link
                          className="dropdown-item"
                          to="/profile"
                          onClick={() => setMenuOuvert(false)}
                        >
                          <FaUser className="me-2" /> Profil
                        </Link>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button className="dropdown-item text-danger" onClick={handleLogout}>
                          <FaSignOutAlt className="me-2" /> Déconnexion
                        </button>
                      </li>
                    </ul>
                  )}
                </li>
              </ul>
            </>
          ) : (
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/login">Connexion</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/register">Inscription</Link>
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;