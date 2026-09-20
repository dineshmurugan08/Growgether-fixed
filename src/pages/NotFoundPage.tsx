import React from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Compass, Home } from 'lucide-react';

interface NotFoundPageProps {
  onNavigateHome?: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigateHome }) => {
  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <Card style={{ maxWidth: '480px', width: '100%', textAlign: 'center', padding: '3rem 2rem' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--purple-soft)', border: '1px solid rgba(139, 92, 246, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--purple-indigo)', margin: '0 auto 1.25rem auto' }}>
          <Compass size={32} />
        </div>

        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#ffffff' }}>404 - View Not Found</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: 1.5 }}>
          The page or route you requested does not exist or has been moved. Keep your consistency streak going on the main dashboard!
        </p>

        <Button
          variant="primary"
          icon={<Home size={16} />}
          onClick={onNavigateHome || (() => window.location.href = '/')}
        >
          Return to Dashboard
        </Button>
      </Card>
    </div>
  );
};

export default NotFoundPage;
