import React from 'react';
import type { Linha } from '../types/Linha'; 

interface CardProps {
  dados: Linha; 
}

export const Card: React.FC<CardProps> = ({ dados }) => {
  return (
    <div style={{ 
      border: '1px solid #ddd', 
      padding: '15px', 
      borderRadius: '8px',
      backgroundColor: '#fff',
      boxShadow: '2px 2px 5px rgba(0,0,0,0.05)',
      transition: 'background 0.2s'
    }}>
      {/* Trocamos nome por cd_linha */}
      <h3 style={{ margin: 0, color: '#2c3e50', fontSize: '1rem' }}>
        Linha {dados.cd_linha || 'S/N'}
      </h3>
      
      {/* Trocamos rota por tx_linha */}
      <p style={{ color: '#7f8c8d', margin: '5px 0 0 0', fontSize: '0.9rem' }}>
        {dados.tx_linha || 'Descrição não disponível'}
      </p>
    </div>
  );
};