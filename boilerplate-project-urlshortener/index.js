require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const url = require('url');
const fs = require('fs');
const app = express();

const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// ฟังก์ชันช่วยในการอ่านและเขียนไฟล์
const readData = () => {
  if (!fs.existsSync('urls.json')) {
    fs.writeFileSync('urls.json', JSON.stringify([]));
  }
  const data = fs.readFileSync('urls.json');
  return JSON.parse(data);
};

const writeData = (data) => {
  fs.writeFileSync('urls.json', JSON.stringify(data, null, 2));
};

// ตรวจสอบ URL ว่าถูกต้องหรือไม่
const isValidUrl = (str) => {
  const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(str);
};

// Endpoint สำหรับย่อ URL
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  // ตรวจสอบว่า URL ที่ส่งเข้ามาถูกต้อง
  if (!isValidUrl(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  const hostname = url.parse(originalUrl).hostname;
  dns.lookup(hostname, (err, address) => {
    if (err) {
      res.json({ error: 'invalid url' });
    } else {
      let data = readData();
      let shortUrl = data.length + 1;
      let newUrl = { original_url: originalUrl, short_url: shortUrl };
      
      data.push(newUrl);
      writeData(data);
      
      res.json({ original_url: originalUrl, short_url: shortUrl });
    }
  });
});

// Endpoint สำหรับการเข้าถึง URL ย่อ
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = parseInt(req.params.short_url, 10);
  let data = readData();
  
  let urlEntry = data.find(entry => entry.short_url === shortUrl);
  if (urlEntry) {
    res.redirect(urlEntry.original_url);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
