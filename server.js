const express = require('express');
const app = express();
const bp = require('body-parser');

app.use(express.static('public'));


app.get('/getTest', function (req, res) {
  res.send('Hello World!')
});

app.listen(process.env.PORT || 3000,() => console.log("Listening on 3000"));
