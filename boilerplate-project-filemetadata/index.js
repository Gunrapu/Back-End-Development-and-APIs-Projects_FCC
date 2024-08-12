const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const app = express();
require('dotenv').config();

const port = process.env.PORT || 3000;

const upload = multer({ dest: 'upload/' });

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


app.post('/api/fileanalyse', upload.single('upfile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json.apply({ error: 'No file uploaded' });
  }

  const fileMetadata = {
    name: req.file.originalname,
    type: req.file.mimetype,
    size: req.file.size
  }

  res.json(fileMetadata);

});


app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});
