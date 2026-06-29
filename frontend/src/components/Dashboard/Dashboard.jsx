import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { livreApi } from '../../api/livreApi';
import { empruntApi } from '../../api/empruntApi';
import { penaliteApi } from '../../api/penaliteApi';
import { FaBook, FaHandshake, FaMoneyBillWave, FaBell } from 'react-icons/fa';
import { Card, Row, Col, Spinner } from 'react-bootstrap';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalLivres: 0,
    livresDisponibles: 0,
    empruntsActifs: 0,
    penalitesImpayees: 0,
    notifications: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [livresStats, penalites] = await Promise.all([
          livreApi.getStatistiques(),
          penaliteApi.getTotalImpaye(user?.id)
        ]);
        
        setStats({
          totalLivres: livresStats.data.total_livres || 0,
          livresDisponibles: livresStats.data.livres_disponibles || 0,
          empruntsActifs: user?.pretsActifs || 0,
          penalitesImpayees: penalites.data.totalImpaye || 0,
          notifications: 0
        });
      } catch (error) {
        console.error('Erreur lors du chargement des stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const cards = [
    {
      title: 'Livres en bibliothèque',
      value: stats.totalLivres,
      icon: <FaBook size={40} className="text-primary" />,
      color: 'primary'
    },
    {
      title: 'Livres disponibles',
      value: stats.livresDisponibles,
      icon: <FaBook size={40} className="text-success" />,
      color: 'success'
    },
    {
      title: 'Emprunts en cours',
      value: stats.empruntsActifs,
      icon: <FaHandshake size={40} className="text-warning" />,
      color: 'warning'
    },
    {
      title: 'Pénalités impayées',
      value: `${stats.penalitesImpayees.toFixed(2)} F`,
      icon: <FaMoneyBillWave size={40} className="text-danger" />,
      color: 'danger'
    }
  ];

  return (
    <div>
      <h2 className="mb-4">Tableau de bord</h2>
      <p className="text-muted mb-4">
        Bienvenue {user?.prenom} {user?.nom} !
      </p>
      
      <Row>
        {cards.map((card, index) => (
          <Col md={3} key={index} className="mb-4">
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted">{card.title}</h6>
                    <h3>{card.value}</h3>
                  </div>
                  <div className={`text-${card.color}`}>{card.icon}</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="mt-4">
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Dernières activités</h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted">Aucune activité récente</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Notifications</h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted">Aucune notification</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;