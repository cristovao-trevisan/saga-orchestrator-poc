import app from './routes/app';
import { enqueueExisting } from './saga/runner/queue-saga';

enqueueExisting();

export const { PORT = 3009 } = process.env;
app.listen(PORT, () => console.log(`SERVER ON: localhost:${PORT}`));
