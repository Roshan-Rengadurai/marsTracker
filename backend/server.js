require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());

app.get('/', (req, res) => {
  res.send('Backend server is running.');
});


app.get('/weather', async (req, res) => {
  try {
    const response = await axios.get(`https://api.nasa.gov/insight_weather/?api_key=${process.env.NASA_API_KEY}&feedtype=json&ver=1.0`);
    const weatherData = response.data;
    const solKeys = weatherData.sol_keys || [];
    const marsWeather = {};

    solKeys.forEach(sol => {
      const solData = weatherData[sol];
      if (solData) {
        marsWeather[`sol${sol}`] = {
          temperature: {
            average: solData.AT?.av,
            min: solData.AT?.mn,
            max: solData.AT?.mx,
          },
          wind: {
            average: solData.HWS?.av,
            min: solData.HWS?.mn,
            max: solData.HWS?.mx,
          },
          pressure: {
            average: solData.PRE?.av,
            min: solData.PRE?.mn,
            max: solData.PRE?.mx,
          },
          firstUTC: solData.First_UTC,
          lastUTC: solData.Last_UTC,
        };
      }
    });

    res.json({ marsWeather });
    console.log(marsWeather);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

app.get('/photos', async (req, res) => {
  try {
    const { sol = 3000, camera = 'fhaz' } = req.query;
    const response = await axios.get(`https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=${sol}&camera=${camera}&api_key=${process.env.NASA_API_KEY}`);
    const marsPhotos = response.data.photos.map(photo => photo.img_src);
    res.json({ marsPhotos });
    console.log(marsPhotos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

app.get('/api-limits', async (req, res) => {
  try {
    const response = await axios.get(`https://api.nasa.gov/insight_weather/?api_key=${process.env.NASA_API_KEY}&feedtype=json&ver=1.0`);
    res.json({
      limit: response.headers['x-ratelimit-limit'],
      remaining: response.headers['x-ratelimit-remaining'],
    });
    console.log(response.headers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch API limits' });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});