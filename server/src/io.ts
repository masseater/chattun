import { Server, Socket } from 'socket.io';
import type * as http from 'http';
import { webClient, slackEmitter } from './slack';
import { logger } from './logger';

export const configureIO = (server: http.Server, middleware: (...args: any[]) => void) => {
  const io = new Server(server);
  io.use((socket, next) => {
    middleware(socket.request as any, {} as any, next as any);
  });
  io.on('connection', (socket) => {
    const listener = async (evt: any) => {
      evt.ack();

      const res = await webClient.apps.event.authorizations.list({
        event_context: evt.body.event_context,
      });

      const matched = res.authorizations?.some(
        (auth) => auth.user_id === (socket.request as any).session.slack.user.id,
      );
      logger.log('start matching');
      if (matched) {
        logger.log('app emitted');
        socket.emit('message', evt.event);
      }
    };
    slackEmitter.on('message', listener);

    socket.on('disconnect', () => {
      slackEmitter.removeListener('message', listener);
    });
  });
};
