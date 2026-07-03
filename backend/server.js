const app = require('./app');
const connectDB = require('./config/db');
const dns = require("dns");

const PORT = process.env.PORT || 5000;
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Connect to MongoDB
connectDB();

const server = app.listen(PORT, () => {
  console.log(`🥛 Doodh Ledger Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});
