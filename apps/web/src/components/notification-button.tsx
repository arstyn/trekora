import { useState } from 'react';
import { useNotifications } from '../hooks/use-notifications';

// Dummy: Replace with your auth context/token logic
function useAuthToken() {
  // TODO: Replace with real auth token retrieval
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

export function NotificationButton() {
  const token = useAuthToken();
  const { notifications, unreadCount, markAsRead } = useNotifications(token);
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
        aria-label="Notifications"
      >
        <span role="img" aria-label="bell">
          🔔
        </span>
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              background: 'red',
              color: 'white',
              borderRadius: '50%',
              padding: '2px 6px',
              fontSize: '12px',
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: 4,
            minWidth: 250,
            zIndex: 100,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            maxHeight: 400,
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              padding: 8,
              borderBottom: '1px solid #eee',
              fontWeight: 'bold',
            }}
          >
            Notifications
          </div>
          {notifications.length === 0 && (
            <div style={{ padding: 16, color: '#888' }}>No notifications</div>
          )}
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markAsRead(n.id)}
              style={{
                padding: 12,
                background: n.isRead ? '#f9f9f9' : '#e6f7ff',
                borderBottom: '1px solid #eee',
                cursor: 'pointer',
                fontWeight: n.isRead ? 'normal' : 'bold',
              }}
            >
              {n.message}
              <div style={{ fontSize: 10, color: '#888' }}>
                {new Date(n.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
