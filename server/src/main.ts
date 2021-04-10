import { App, SocketModeReceiver, Installation } from '@slack/bolt';
import express from 'express';

const receiver = new SocketModeReceiver({
  appToken: process.env.SLACK_APP_TOKEN!,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: 'my-state-secret',
  scopes: ['channels:history', 'reactions:read'],
});

const app = new App({ receiver });

app.use(express.static('../public') as any);

app.event('reaction_added', ({ event }) => {
  console.log(event);
  return Promise.resolve();
});

(async () => {
  await app.start(3100);
  console.log('⚡️ Bolt app started!!!!');
})();
