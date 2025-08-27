import React from 'react';

function MinimalApp() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f0f9ff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#1f2937', marginBottom: '1rem' }}>
          Step-and-Save
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
          Application is working! 🎉
        </p>
        <button 
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          onClick={() => alert('React is working!')}
        >
          Test Button
        </button>
      </div>
    </div>
  );
}

export default MinimalApp;