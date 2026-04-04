import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// Mock weather service — returns simulated data for Indian cities
const CITY_WEATHER = {
  Mumbai: { rainfall: 120, temperature: 31, aqi: 180 },
  Delhi: { rainfall: 30, temperature: 38, aqi: 350 },
  Bangalore: { rainfall: 60, temperature: 27, aqi: 120 },
  Chennai: { rainfall: 100, temperature: 34, aqi: 140 },
  Hyderabad: { rainfall: 45, temperature: 36, aqi: 190 },
  Kolkata: { rainfall: 80, temperature: 33, aqi: 210 },
  Pune: { rainfall: 55, temperature: 29, aqi: 100 },
};

export const fetchWeatherForCity = async (city) => {
  if (process.env.MOCK_WEATHER === 'true') {
    return getMockWeather(city);
  }

  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) throw new Error("OPENWEATHER_API_KEY is not configured.");

    // Fetch Current Weather
    const weatherRes = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city},in&appid=${apiKey}&units=metric`
    );
    const data = weatherRes.data;

    let rainfall = 0;
    if (data.rain) {
      rainfall = data.rain['1h'] || data.rain['3h'] || 0;
    }

    const temp = data.main.temp;
    const lat = data.coord.lat;
    const lon = data.coord.lon;

    // Fetch AQI Data
    let aqi = 50; // default safe
    try {
      const aqiRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
      );
      const aqiIndex = aqiRes.data.list[0].main.aqi; 
      // Map OWM 1-5 index to approximate US AQI to fit our models
      const aqiMap = { 1: 30, 2: 70, 3: 130, 4: 220, 5: 350 };
      aqi = aqiMap[aqiIndex] || 50;
    } catch (aqiErr) {
      console.warn(`Failed to fetch AQI for ${city}:`, aqiErr.message);
    }

    return {
      rainfall: Math.round(rainfall),
      temperature: Math.round(temp),
      aqi: aqi
    };
  } catch (error) {
    console.error(`Error fetching real weather for ${city}:`, error.message);
    console.log(`Falling back to mock weather for ${city}`);
    return getMockWeather(city);
  }
};

const getMockWeather = (city) => {
  const base = CITY_WEATHER[city] || { rainfall: 50, temperature: 30, aqi: 150 };
  const jitter = (val, range) => Math.max(0, val + (Math.random() * range * 2 - range));

  return {
    rainfall: Math.round(jitter(base.rainfall, 20)),
    temperature: Math.round(jitter(base.temperature, 3)),
    aqi: Math.round(jitter(base.aqi, 30)),
  };
};
