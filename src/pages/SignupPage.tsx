import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { TextField } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { Sparkles, ArrowRight, AlertCircle, CheckCircle2, User, AtSign, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SignupPageProps {
  onNavigateToLogin: () => void;
  onSignupSuccess: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onNavigateToLogin, onSignupSuccess }) => {
  const { signUp } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!displayName.trim() || displayName.trim().length < 2) {
      setErrorMsg('Display Name must be at least 2 characters.');
      return;
    }

    const cleanUser = username.trim().toLowerCase().replace('@', '');
    if (cleanUser.length < 3 || cleanUser.length > 20) {
      setErrorMsg('User ID must be between 3 and 20 characters.');
      return;
    }

    if (!/^[a-z0-9_]+$/.test(cleanUser)) {
      setErrorMsg('User ID can only contain letters, numbers, and underscores (e.g. alex_rivers).');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await signUp({
        displayName: displayName.trim(),
        username: cleanUser,
        password,
      });
      onSignupSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Signup failed. Please try again.');
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
          <h2>Create Your Account</h2>
          <p>"Build yourself. Grow together."</p>
        </div>

        <Card emeraldGlow className="gt-auth-card">
          <Badge variant="emerald" style={{ marginBottom: '1rem' }}>Step 1 of 1: Profile Setup</Badge>

          {errorMsg && (
            <div className="gt-auth-error-banner">
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="gt-auth-form">
            {/* Display Name */}
            <TextField
              label="Display Name"
              type="text"
              placeholder="e.g. Alex Rivers"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              required
            />

            {/* Unique User ID */}
            <div>
              <label className="gt-label">Unique User ID (Username)</label>
              <div style={{ position: 'relative', marginTop: '0.25rem' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-400)', fontWeight: 700 }}>
                  @
                </span>
                <input
                  className="gt-input"
                  style={{ paddingLeft: '28px' }}
                  type="text"
                  placeholder="alex_rivers"
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  required
                />
              </div>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '3px', display: 'block' }}>
                Used for your public accountability circle (@3-20 characters)
              </span>
            </div>

            {/* Password */}
            <TextField
              label="Secure Password"
              type="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />

            <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ marginTop: '3px' }} />
                <span>
                  I agree to the GrowTogether Philosophy: I commit to building daily habits and supporting my circle.
                </span>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              style={{ width: '100%', marginTop: '0.5rem' }}
              icon={<ArrowRight size={16} />}
              disabled={loading}
            >
              {loading ? 'Creating Your Account...' : 'Create Account & Enter App'}
            </Button>
          </form>

          <div className="gt-auth-footer">
            <span>Already have an account?</span>{' '}
            <button className="gt-auth-link" onClick={onNavigateToLogin}>
              Sign In Here
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
