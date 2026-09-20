import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { TextField } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { Sparkles, ArrowRight, AlertCircle, Lock, AtSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onNavigateToSignup: () => void;
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigateToSignup, onLoginSuccess }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('alex_grower');
  const [password, setPassword] = useState('password123');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim()) {
      setErrorMsg('Please enter your User ID.');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      await login({
        username: username.trim().replace('@', ''),
        password,
      });
      onLoginSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gt-auth-page">
      <div className="gt-auth-container">
        <div className="gt-auth-header">
          <div className="gt-auth-logo">
            <Sparkles size={24} />
          </div>
          <h2>Sign In to GrowTogether</h2>
          <p>"Build yourself. Grow together."</p>
        </div>

        <Card emeraldGlow className="gt-auth-card">
          <Badge variant="emerald" style={{ marginBottom: '1rem' }}>Account Sign In</Badge>

          {errorMsg && (
            <div className="gt-auth-error-banner">
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="gt-auth-form">
            <div>
              <label className="gt-label">User ID (Username)</label>
              <div style={{ position: 'relative', marginTop: '0.25rem' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-400)', fontWeight: 700 }}>
                  @
                </span>
                <input
                  className="gt-input"
                  style={{ paddingLeft: '28px' }}
                  type="text"
                  placeholder="alex_grower"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <TextField
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.775rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked /> Remember session
              </label>
              <a href="#demo" onClick={() => { setUsername('alex_grower'); setPassword('password123'); }} style={{ color: 'var(--primary-400)' }}>
                Fill Demo Credentials
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              style={{ width: '100%', marginTop: '0.5rem' }}
              icon={<ArrowRight size={16} />}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </Button>
          </form>

          <div className="gt-auth-footer">
            <span>Don't have an account?</span>{' '}
            <button className="gt-auth-link" onClick={onNavigateToSignup}>
              Create Unique User ID Free
            </button>
          </div>
        </Card>
      </div>

      <style>{`
        .gt-auth-page {
          min-height: 100vh;
          background-color: var(--bg-app);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
        }

        .gt-auth-container {
          width: 100%;
          max-width: 440px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        .gt-auth-header {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .gt-auth-logo {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--primary-500), var(--primary-700));
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 0 20px var(--primary-glow);
        }

        .gt-auth-header h2 {
          font-size: 1.65rem;
        }

        .gt-auth-header p {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .gt-auth-card {
          width: 100%;
          padding: 1.75rem;
        }

        .gt-auth-error-banner {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 0.875rem;
          background: rgba(244, 63, 94, 0.12);
          border: 1px solid rgba(244, 63, 94, 0.3);
          border-radius: var(--radius-xs);
          color: #fda4af;
          font-size: 0.825rem;
          margin-bottom: 1rem;
        }

        .gt-auth-form {
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
        }

        .gt-auth-footer {
          text-align: center;
          margin-top: 1.25rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .gt-auth-link {
          background: transparent;
          border: none;
          color: var(--primary-400);
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
        }

        .gt-auth-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};
