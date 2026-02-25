import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// In-memory state
const tournaments: Record<string, any> = {};

io.on('connection', (socket) => {
  socket.on('check_tournament', (id, callback) => {
    callback(!!tournaments[id]);
  });

  socket.on('join_tournament', (id) => {
    socket.join(id);
    if (tournaments[id]) {
      socket.emit('tournament_state', tournaments[id]);
    }
  });

  socket.on('leave_tournament', (id) => {
    socket.leave(id);
  });

  socket.on('create_tournament', (tournament) => {
    tournaments[tournament.id] = tournament;
  });

  socket.on('update_tournament', (id, tournament) => {
    tournaments[id] = tournament;
    socket.to(id).emit('tournament_state', tournament);
  });
});

async function startServer() {
  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
