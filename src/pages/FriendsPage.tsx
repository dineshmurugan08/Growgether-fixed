import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { friendsService } from '../services/friendsService';
import { UserProfile, UserSearchResult, FriendshipRecord } from '../types';
import { EncouragementPickerModal } from '../components/friends/EncouragementPickerModal';
import { EncouragementStreamCard } from '../components/friends/EncouragementStreamCard';
import { MotivationalToast } from '../components/habits/MotivationalToast';
import {
  Users,
  UserPlus,
  Search,
  CheckCircle2,
  Flame,
  Heart,
  UserX,
  UserCheck,
} from 'lucide-react';

export const FriendsPage: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id || 'guest_user';

  // Search & Results State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);

  // Roster & Requests State
  const [friendsList, setFriendsList] = useState<UserProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Array<{ record: FriendshipRecord; requester: UserProfile }>>([]);

  // Encouragement Picker Modal State
  const [pickerModal, setPickerModal] = useState<{ open: boolean; friendId: string; friendName: string }>({
    open: false,
    friendId: '',
    friendName: '',
  });

  // Toast feedback
  const [toastInfo, setToastInfo] = useState<{ show: boolean; message: string; streak: number }>({
    show: false,
    message: '',
    streak: 1,
  });

  const loadData = () => {
    if (!userId) return;
    friendsService.ensureSeedAccounts().then(() => {
      const friends = friendsService.getFriendsList(userId);
      const pending = friendsService.getPendingRequests(userId);
      setFriendsList(friends);
      setPendingRequests(pending);

      if (searchQuery.trim()) {
        handleSearch(searchQuery);
      }
    });
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const results = await friendsService.searchUsers(userId, query);
    setSearchResults(results);
  };

  // Actions
  const handleSendRequest = (targetUserId: string, targetUsername: string) => {
    friendsService.sendFriendRequest(userId, targetUserId);
    loadData();
    setToastInfo({
      show: true,
      message: `Friend request sent to @${targetUsername}!`,
      streak: 1,
    });
  };

  const handleAcceptRequest = (requesterId: string, requesterUsername: string) => {
    friendsService.acceptFriendRequest(userId, requesterId);
    loadData();
    setToastInfo({
      show: true,
      message: `You are now accountability friends with @${requesterUsername}! 🎉`,
      streak: 1,
    });
  };

  const handleRejectRequest = (requesterId: string) => {
    friendsService.rejectFriendRequest(userId, requesterId);
    loadData();
  };

  const handleRemoveFriend = (friendId: string, friendUsername: string) => {
    if (window.confirm(`Are you sure you want to remove @${friendUsername} from your friends circle?`)) {
      friendsService.removeFriend(userId, friendId);
      loadData();
    }
  };

  const handleBlockUser = (targetUserId: string, targetUsername: string) => {
    if (window.confirm(`Block @${targetUsername}?`)) {
      friendsService.blockUser(userId, targetUserId);
      loadData();
    }
  };

  const handleUnblockUser = (targetUserId: string) => {
    friendsService.unblockUser(userId, targetUserId);
    loadData();
  };

  const openEncouragementPicker = (friendId: string, friendName: string) => {
    setPickerModal({
      open: true,
      friendId,
      friendName,
    });
  };

  return (
    <div className="gt-page">
      {/* Toast Notification */}
      {toastInfo.show && (
        <MotivationalToast
          message={toastInfo.message}
          streakCount={toastInfo.streak}
          onClose={() => setToastInfo(prev => ({ ...prev, show: false }))}
        />
      )}

      {/* Header */}
      <header className="gt-page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
            <Users size={26} color="var(--purple-indigo)" />
            <h1 style={{ fontSize: '1.85rem' }}>Friendship Circle & Encouragement</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
            "Build yourself. Grow together." — Exchange quick, lightweight encouragement reactions with accountability partners.
          </p>
        </div>
      </header>

      {/* Received Encouragements Stream */}
      <EncouragementStreamCard />

      {/* Search Section: Search by User ID */}
      <Card emeraldGlow style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Search size={18} color="var(--primary-400)" /> Search Member by User ID
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Type a User ID (e.g. <code style={{ color: 'var(--primary-300)', background: 'rgba(16,185,129,0.1)', padding: '2px 6px', borderRadius: '4px' }}>dinesh_eee</code>, <code style={{ color: 'var(--primary-300)', background: 'rgba(16,185,129,0.1)', padding: '2px 6px', borderRadius: '4px' }}>maya_grows</code>) to send a request.
            </p>
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="gt-input"
              style={{ paddingLeft: '2.5rem', fontSize: '0.95rem' }}
              placeholder="Enter User ID (e.g. dinesh_eee)..."
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>

          {/* Search Results Display */}
          {searchQuery.trim() !== '' && (
            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Search Results ({searchResults.length})
              </div>

              {searchResults.length === 0 ? (
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  No members found matching User ID "{searchQuery}".
                </div>
              ) : (
                searchResults.map(({ profile, friendshipState }) => (
                  <div
                    key={profile.id}
                    style={{
                      padding: '1rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                      <div className="gt-user-avatar-circle">
                        {profile.displayName.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <strong style={{ fontSize: '1rem', color: '#ffffff' }}>{profile.displayName}</strong>
                          <span style={{ fontSize: '0.8rem', color: 'var(--primary-400)', fontWeight: 600 }}>
                            @{profile.username}
                          </span>
                        </div>
                        {profile.bio && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {profile.bio}
                          </div>
                        )}
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          🔥 {profile.streakCount || 1} Day Streak
                        </div>
                      </div>
                    </div>

                    {/* Friendship Action Button based on state */}
                    <div>
                      {friendshipState === 'none' && (
                        <Button
                          size="sm"
                          variant="primary"
                          icon={<UserPlus size={15} />}
                          onClick={() => handleSendRequest(profile.id, profile.username)}
                        >
                          Add Friend
                        </Button>
                      )}

                      {friendshipState === 'pending_sent' && (
                        <Button size="sm" variant="ghost" disabled style={{ opacity: 0.8 }}>
                          Request Sent ⏳
                        </Button>
                      )}

                      {friendshipState === 'pending_received' && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Button
                            size="sm"
                            variant="primary"
                            icon={<CheckCircle2 size={15} />}
                            onClick={() => handleAcceptRequest(profile.id, profile.username)}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRejectRequest(profile.id)}
                          >
                            Reject
                          </Button>
                        </div>
                      )}

                      {friendshipState === 'accepted' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Badge variant="emerald" icon={<UserCheck size={12} />}>Friends ✓</Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveFriend(profile.id, profile.username)}
                          >
                            Remove
                          </Button>
                        </div>
                      )}

                      {friendshipState === 'blocked_by_me' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Badge variant="neutral">Blocked</Badge>
                          <Button size="sm" variant="ghost" onClick={() => handleUnblockUser(profile.id)}>
                            Unblock
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Pending Requests Inbox */}
      {pendingRequests.length > 0 && (
        <Card style={{ borderLeft: '4px solid var(--purple-indigo)' }}>
          <div className="gt-card-header">
            <h3 className="gt-card-title">
              <UserPlus size={18} color="var(--purple-indigo)" /> Incoming Friend Requests ({pendingRequests.length})
            </h3>
            <Badge variant="purple">Action Required</Badge>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pendingRequests.map(({ requester }) => (
              <div
                key={requester.id}
                style={{
                  padding: '0.875rem 1rem',
                  background: 'rgba(139, 92, 246, 0.08)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.875rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="gt-user-avatar-circle">
                    {requester.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <strong style={{ color: 'white' }}>{requester.displayName}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary-400)', marginLeft: '0.375rem' }}>
                      @{requester.username}
                    </span>
                    {requester.bio && (
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>{requester.bio}</div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button
                    size="sm"
                    variant="primary"
                    icon={<CheckCircle2 size={14} />}
                    onClick={() => handleAcceptRequest(requester.id, requester.username)}
                  >
                    Accept Request
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRejectRequest(requester.id)}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Friends Roster */}
      <Card>
        <div className="gt-card-header">
          <h3 className="gt-card-title">
            <Users size={18} color="var(--primary-400)" /> My Accountability Friends ({friendsList.length})
          </h3>
          <Badge variant="emerald">{friendsList.length} Connected</Badge>
        </div>

        {friendsList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <Users size={36} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
            <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>No friends added yet</h4>
            <p style={{ fontSize: '0.875rem' }}>
              Search for User IDs like <code style={{ color: 'var(--primary-300)' }}>dinesh_eee</code> above to build your circle!
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {friendsList.map(friend => (
              <Card key={friend.id} style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.875rem' }}>
                  <div className="gt-user-avatar-circle lg">
                    {friend.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', color: 'white', margin: 0 }}>{friend.displayName}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary-400)', fontWeight: 600 }}>
                      @{friend.username}
                    </span>
                  </div>
                </div>

                <Badge variant="amber" icon={<Flame size={12} style={{ marginRight: '4px' }} />}>
                  {friend.streakCount || 1} Day Streak Active 🔥
                </Badge>

                {friend.bio && (
                  <p style={{ fontSize: '0.835rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
                    {friend.bio}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.875rem' }}>
                  <Button
                    size="sm"
                    variant="soft"
                    style={{ flex: 1 }}
                    icon={<Heart size={14} color="#ec4899" fill="#ec4899" />}
                    onClick={() => openEncouragementPicker(friend.id, friend.displayName)}
                  >
                    Send Encouragement
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<UserX size={14} color="#ef4444" />}
                    onClick={() => handleRemoveFriend(friend.id, friend.username)}
                  >
                    Remove
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleBlockUser(friend.id, friend.username)}
                  >
                    Block
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Encouragement Reaction Picker Modal */}
      <EncouragementPickerModal
        isOpen={pickerModal.open}
        onClose={() => setPickerModal(prev => ({ ...prev, open: false }))}
        recipientId={pickerModal.friendId}
        recipientName={pickerModal.friendName}
        onSendSuccess={msg => {
          loadData();
          setToastInfo({ show: true, message: msg, streak: 1 });
        }}
      />

      <style>{`
        .gt-page { display: flex; flex-direction: column; gap: 1.5rem; }
        .gt-page-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }

        .gt-user-avatar-circle {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary-500), var(--purple-indigo));
          color: white;
          font-weight: 800;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .gt-user-avatar-circle.lg {
          width: 48px;
          height: 48px;
          font-size: 1.25rem;
        }
      `}</style>
    </div>
  );
};
