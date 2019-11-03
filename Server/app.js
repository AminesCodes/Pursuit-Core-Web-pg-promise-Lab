const express = require('express');
const cors = require('cors');

const app = express();
const port = 29000;

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const usersRouter = require('./routes/usersRouter');
app.use('/users', usersRouter);

const postsRouter = require('./routes/postsRouter');
app.use('/posts', postsRouter);


app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});