const { Server } = require('socket.io');
const { verifyAuthToken } = require('../utils/jwt');

let io = null;

/**
 * Rooms convention:
 *  - `user:<userId>`  — a customer joins this to receive updates on their own orders
 *  - `admin`          — all admins join this to receive new-order / stock alerts
 */
function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL || '*', credentials: true },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));
      const payload = verifyAuthToken(token);
      socket.userId = payload.sub;
      socket.role = payload.role;
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`);
    if (socket.role === 'admin') {
      socket.join('admin');
    }
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.IO not initialized yet');
  return io;
}

function emitOrderStatusUpdate(order) {
  getIO().to(`user:${order.user.toString()}`).emit('order:status', {
    orderId: order._id,
    status: order.status,
    statusHistory: order.statusHistory,
  });
  getIO().to('admin').emit('admin:order-updated', { orderId: order._id, status: order.status });
}

function emitNewOrder(order) {
  getIO().to('admin').emit('admin:new-order', { orderId: order._id, total: order.total });
}

function emitStockAlert(notification) {
  getIO().to('admin').emit('admin:stock-alert', notification);
}

module.exports = { initSocket, getIO, emitOrderStatusUpdate, emitNewOrder, emitStockAlert };
