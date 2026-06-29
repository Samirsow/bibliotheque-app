import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api/authApi';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  console.log('handleSubmit déclenché', { email, motDePasse }); // ✅ ajout
  setLoading(true);
  try {
    console.log('Avant appel API'); // ✅ ajout
    const response = await authApi.login(email, motDePasse);
    console.log('Réponse reçue', response); // ✅ ajout
    const { token, ...userData } = response.data;
    login(token, userData);
    toast.success('Connexion réussie !');
    navigate('/dashboard');
  } catch (error) {
    console.error('Erreur capturée', error); // ✅ ajout
    toast.error(error.response?.data?.error || 'Erreur de connexion');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card p-4">
            <h2 className="text-center mb-4">Connexion</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <div className="input-group">
                  <span className="input-group-text"><FaEnvelope /></span>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="votre@email.com"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Mot de passe</label>
                <div className="input-group">
                  <span className="input-group-text"><FaLock /></span>
                  <input
                    type="password"
                    className="form-control"
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    required
                    placeholder="********"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
            <div className="text-center mt-3">
              <Link to="/register">Pas encore inscrit ? Créer un compte</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;