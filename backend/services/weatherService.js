import axios from "axios";

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || "demo-key";
const AQI_API_KEY = process.env.AQI_API_KEY || "demo-key";

export const fetchWeatherForCity = async (city) => {
  try {
    if (process.env.MOCK_WEATHER === "true") {
      return {
        rainfall: 5,
        temperature: 32,
        aqi: 120,
      };
    }

    // Placeholder for real OpenWeather + AQI integration
    // For hackathon, it's enough to simulate with static values.
    const rainfall = 10;
    const temperature = 30;
    const aqi = 150;

    return { rainfall, temperature, aqi };
  } catch (err) {
    console.error("Weather API error", err.message);
    return { rainfall: 0, temperature: 0, aqi: 0 };
  }
};

