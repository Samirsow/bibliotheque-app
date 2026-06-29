import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { livreApi } from '../../api/livreApi';

const ModifierLivre = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    titre: '',
    auteur: '',
    isbn: '',
    editeur: '',
    anneePublication: '',
    categorie: '',
    description: '',
    nombreExemplaires: 1,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    chargerLivre();
  }, [id]);

  const chargerLivre = async () => {
    try {
      const response = await livreApi.getById(id);
      const livre = response.data;
      setFormData({
        titre: livre.titre || '',
        auteur: livre.auteur || '',
        isbn: livre.isbn || '',
        editeur: livre.editeur || '',
        anneePublication: livre.anneePublication || '',
        categorie: livre.categorie || '',
        description: livre.description || '',
        nombreExemplaires: livre.nombreExemplaires || 1,
      });
    } catch (err) {
      setError("Impossible de charger ce livre.");
    } finally {
      setChargement(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await livreApi.update(id, formData);
      setSuccess('Livre modifié avec succès !');
      setTimeout(() => {
        navigate('/livres');
      }, 1500);
    } catch (err) {
      setError(
        'Erreur lors de la modification : ' +
          (err.response?.data?.error || err.message)
      );
      setLoading(false);
    }
  };

  if (chargement) {
    return <Container className="py-4">Chargement…</Container>;
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">Modifier le livre</h1>
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
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>ISBN</Form.Label>
              <Form.Control
                type="text"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                placeholder="Sans tirets"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Éditeur</Form.Label>
              <Form.Control
                type="text"
                name="editeur"
                value={formData.editeur}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Année de publication</Form.Label>
              <Form.Control
                type="number"
                name="anneePublication"
                value={formData.anneePublication}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Catégorie</Form.Label>
              <Form.Control
                type="text"
                name="categorie"
                value={formData.categorie}
                onChange={handleChange}
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
              />
            </Form.Group>

            <div className="d-flex gap-2">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Enregistrement…' : 'Enregistrer les modifications'}
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

export default ModifierLivre;