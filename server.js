const express = require('express');
const app = express();
const bp = require('body-parser');

app.use(express.static('public'));


app.get('/getTest', function (req, res) {
  res.send('Hello World!')
});

const server = app.listen(process.env.PORT || 8080, () => {
  console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
});

module.exports = server;
