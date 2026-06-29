import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const BoutonRetour = ({ to = '/dashboard', label = 'Retour' }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(to)}
      className="btn btn-link text-decoration-none text-muted ps-0 mb-3 d-flex align-items-center gap-2"
    >
      <FaArrowLeft />
      {label}
    </button>
  );
};

export default BoutonRetour;