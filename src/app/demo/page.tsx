'use client';
import { useEffect } from 'react';

export default function DemoPage() {
  useEffect(() => {
    window.location.href = '/app.html';
  }, []);
  
  return (
    <div style={{
      background: '#04080F',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      color: '#00C8FF'
    }}>
      Carregando...
    </div>
  );
}
