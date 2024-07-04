const express = require('express');
const mongoose = require('mongoose');
const shortid = require('shortid');
const dotenv = require('dotenv');
const Url = require('./models/Url');

dotenv.config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));

app.post('/shorten', async (req, res) => {
  const { originalUrl } = req.body;
  const shortUrl = shortid.generate();

  try {
    const url = new Url({ originalUrl, shortUrl });
    await url.save();
    res.json({ originalUrl, shortUrl });
  } catch (err) {
    res.status(500).json('Server error');
  }
});

app.get('/:shortUrl', async (req, res) => {
  const { shortUrl } = req.params;

  try {
    const url = await Url.findOne({ shortUrl });

    if (url) {
      url.visitCount++;
      await url.save();
      return res.redirect(url.originalUrl);
    } else {
      return res.status(404).json('URL not found');
    }
  } catch (err) {
    res.status(500).json('Server error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
