import express from 'express';
import bodyParser from 'body-parser';
import buildSaga from '../saga/definitions/booking-saga';
import { enqueue } from '../saga/runner/queue-saga';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/book-travel', async (req, res) => {
  const { webhook, ...params } = req.body;
  const saga = buildSaga(webhook, params);
  await enqueue(saga);
  res.send('booking');
});

export default app;
