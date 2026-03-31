let _io = null;

/**
 * Initialize the socket manager with the io instance
 * Called once in server.js after Socket.io setup
 */
const initSocket = (io) => {
  _io = io;
};

/**
 * Get the io instance from anywhere in the app
 * @returns {import("socket.io").Server}
 */
const getIO = () => {
  if (!_io) {
    throw new Error("Socket.io has not been initialized. Call initSocket(io) first.");
  }
  return _io;
};

module.exports = { initSocket, getIO };
