import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ENCOURAGEMENT_OPTIONS, EncouragementEmoji } from '../../types';
import { encouragementService } from '../../services/encouragementService';
import { useAuth } from '../../context/AuthContext';
import { X, Heart, Sparkles } from 'lucide-react';

interface EncouragementPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
  recipientName: string;
  onSendSuccess: (msg: string) => void;
}

export const EncouragementPickerModal: React.FC<EncouragementPickerModalProps> = ({
  isOpen,
  onClose,
  recipientId,
  recipientName,
  onSendSuccess,
}) => {
  const { user } = useAuth();
  const userId = user?.id || 'guest_user';

  if (!isOpen || !recipientId) return null;

  const handleSelectOption = (emoji: EncouragementEmoji, text: string) => {
    encouragementService.sendEncouragement(userId, recipientId, emoji, text);
    onSendSuccess(`Sent "${emoji} ${text}" to ${recipientName}!`);
    onClose();
  };

  return (
    <div className="gt-modal-overlay">
      <Card className="gt-modal-card">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(236, 72, 153, 0.12)', border: '1px solid rgba(236,72,153,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ec4899' }}>
              <Heart size={18} fill="#ec4899" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Send Quick Encouragement</h3>
              <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                Cheer {recipientName}'s consistency with a lightweight reaction
              </span>
            </div>
          </div>
          <button className="gt-btn-icon-only gt-btn-ghost" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* 5 Quick Reaction Pills Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {ENCOURAGEMENT_OPTIONS.map(option => (
            <button
              key={option.text}
              onClick={() => handleSelectOption(option.emoji, option.text)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.875rem',
                padding: '0.875rem 1.25rem',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                width: '100%',
                textAlign: 'left',
              }}
              className="gt-encouragement-pill-btn"
            >
              <span style={{ fontSize: '1.25rem' }}>{option.emoji}</span>
              <span>{option.text}</span>
            </button>
          ))}
        </div>
      </Card>

      <style>{`
        .gt-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .gt-modal-card {
          width: 100%;
          max-width: 440px;
          padding: 1.75rem;
        }

        .gt-encouragement-pill-btn:hover {
          background: rgba(16, 185, 129, 0.1);
          border-color: var(--border-emerald);
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};
