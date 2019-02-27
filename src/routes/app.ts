import express from 'express';
import bodyParser from 'body-parser';
import buildSaga from '../saga/definitions/booking-saga';
import { enqueue } from '../saga/runner/queue-saga';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/book-travel', async (req, res) => {
  const saga = buildSaga(req.body);
  await enqueue(saga);
  res.send('booking');
});

export default app;
