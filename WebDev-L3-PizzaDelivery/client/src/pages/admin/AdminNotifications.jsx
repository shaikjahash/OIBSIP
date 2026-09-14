import { useEffect, useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getSocket } from '../../services/socket';
import { useToast } from '../../context/ToastContext';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    api.get('/notifications').then(({ data }) => setNotifications(data.notifications)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    function handleStockAlert(notification) {
      setNotifications((prev) => [notification, ...prev]);
      showToast(notification.message, notification.type === 'OUT_OF_STOCK' ? 'error' : 'info');
    }
    function handleNewOrder(payload) {
      showToast(`New order received — ₹${payload.total}`, 'success');
    }

    socket.on('admin:stock-alert', handleStockAlert);
    socket.on('admin:new-order', handleNewOrder);
    return () => {
      socket.off('admin:stock-alert', handleStockAlert);
      socket.off('admin:new-order', handleNewOrder);
    };
  }, [showToast]);

  async function markRead(id) {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  if (loading) return <LoadingSpinner label="Loading notifications…" />;

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Notifications</h1>

      {notifications.length === 0 ? (
        <p className="font-body text-ash">No notifications yet — you'll see low-stock alerts here automatically.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {notifications.map((n) => (
            <li
              key={n._id}
              className={`flex items-center justify-between border rounded-soft px-4 py-3 font-body text-sm ${
                n.isRead ? 'border-char/10 text-ash' : 'border-tomato/30 bg-tomato/5'
              }`}
            >
              <div>
                <p className={n.isRead ? '' : 'font-medium text-char'}>{n.message}</p>
                <p className="text-xs text-ash mt-0.5">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {!n.isRead && (
                <button onClick={() => markRead(n._id)} className="text-tomato hover:underline whitespace-nowrap ml-4">
                  Mark read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
