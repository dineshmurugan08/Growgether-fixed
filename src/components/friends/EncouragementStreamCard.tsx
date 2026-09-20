import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { EncouragementReaction } from '../../types';
import { encouragementService } from '../../services/encouragementService';
import { useAuth } from '../../context/AuthContext';
import { Heart, Sparkles, Flame } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const EncouragementStreamCard: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id || 'guest_user';

  const [receivedEncouragements, setReceivedEncouragements] = useState<EncouragementReaction[]>([]);

  const loadEncouragements = () => {
    if (!userId) return;
    const list = encouragementService.getReceivedEncouragements(userId);
    setReceivedEncouragements(list);
  };

  useEffect(() => {
    loadEncouragements();
  }, [userId]);

  return (
    <Card emeraldGlow style={{ padding: '1.25rem' }}>
      <div className="gt-card-header" style={{ marginBottom: '1rem' }}>
        <h3 className="gt-card-title">
          <Heart size={18} color="#ec4899" fill="#ec4899" /> GrowTogether Encouragement Stream
        </h3>
        <Badge variant="emerald">{receivedEncouragements.length} Received</Badge>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {receivedEncouragements.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No encouragement reactions received yet. Connect with accountability partners to share cheer!
          </div>
        ) : (
          receivedEncouragements.map(enc => (
            <div
              key={enc.id}
              style={{
                padding: '0.875rem 1rem',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', color: '#fff', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {enc.senderDisplayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#ffffff' }}>
                    <strong style={{ color: 'white' }}>{enc.senderDisplayName}</strong> (@{enc.senderUsername})
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {formatDistanceToNow(new Date(enc.createdAt), { addSuffix: true })}
                  </div>
                </div>
              </div>

              {/* Reaction Pill Badge */}
              <div
                style={{
                  padding: '0.35rem 0.85rem',
                  background: 'rgba(236, 72, 153, 0.12)',
                  border: '1px solid rgba(236, 72, 153, 0.3)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#f472b6',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                }}
              >
                <span>{enc.emoji}</span>
                <span>{enc.text}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
