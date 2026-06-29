import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { livreApi } from '../../api/livreApi';

const AjouterLivre = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    titre: '',
    auteur: '',
    isbn: '',
    description: '',
    quantite: 1,
    disponible: true
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await livreApi.create(formData);
      setSuccess('Livre ajouté avec succès !');
      setTimeout(() => {
        navigate('/livres');
      }, 2000);
    } catch (err) {
      setError('Erreur lors de l\'ajout du livre: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Ajouter un nouveau livre</h1>
      <Card>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Titre *</Form.Label>
              <Form.Control
                type="text"
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                required
                placeholder="Entrez le titre du livre"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Auteur *</Form.Label>
              <Form.Control
                type="text"
                name="auteur"
                value={formData.auteur}
                onChange={handleChange}
                required
                placeholder="Entrez le nom de l'auteur"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>ISBN</Form.Label>
              <Form.Control
                type="text"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                placeholder="Entrez le code ISBN"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Description du livre"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Quantité</Form.Label>
              <Form.Control
                type="number"
                name="quantite"
                value={formData.quantite}
                onChange={handleChange}
                min="1"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="disponible"
                label="Disponible à l'emprunt"
                checked={formData.disponible}
                onChange={handleChange}
              />
            </Form.Group>

            <div className="d-flex gap-2">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Ajout en cours...' : 'Ajouter le livre'}
              </Button>
              <Button variant="secondary" onClick={() => navigate('/livres')}>
                Annuler
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AjouterLivre;