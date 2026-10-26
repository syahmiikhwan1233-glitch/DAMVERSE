/**
 * DAMVERSE - Dynamic Weather, Monsoon & Day/Night System
 * Controls environmental lighting, storm inflows, and lightning.
 */

import { DamSimulationState, WeatherType } from '../types/game';
import { sound } from '../audio/soundEngine';

const WEATHER_FLOW_MAP: Record<WeatherType, { inflow: number; rain: number; duration: number }> = {
  cerah: { inflow: 240, rain: 0.0, duration: 180 },
  mendung: { inflow: 340, rain: 0.2, duration: 120 },
  hujan: { inflow: 720, rain: 0.65, duration: 140 },
  ribut_tengkujuh: { inflow: 1550, rain: 1.0, duration: 90 },
  kemarau: { inflow: 75, rain: 0.0, duration: 160 },
};

const WEATHER_CYCLE: WeatherType[] = ['cerah', 'mendung', 'hujan', 'cerah', 'kemarau', 'mendung', 'ribut_tengkujuh', 'cerah'];

export function stepWeatherSystem(state: DamSimulationState, dt: number): Partial<DamSimulationState> {
  // Advance time of day: 24 hours cycle
  // 1 real second * timeSpeed = (1 / 30) game hours (so 1 day takes ~12 minutes at 1x speed)
  const hourDelta = (dt / 30) * state.timeSpeed;
  const newTimeOfDay = (state.timeOfDay + hourDelta) % 24;

  let newWeather = state.weather;
  let remainingDuration = state.weatherDuration - dt;
  let rainIntensity = state.rainIntensity;

  if (remainingDuration <= 0) {
    // Pick next weather
    const currentIndex = WEATHER_CYCLE.indexOf(state.weather);
    const nextIndex = (currentIndex + 1) % WEATHER_CYCLE.length;
    newWeather = WEATHER_CYCLE[nextIndex];
    const targetConfig = WEATHER_FLOW_MAP[newWeather];
    remainingDuration = targetConfig.duration;

    if (newWeather === 'ribut_tengkujuh') {
      sound.playThunder();
    }
  }

  // Smoothly interpolate rain intensity
  const targetRain = WEATHER_FLOW_MAP[newWeather].rain;
  rainIntensity += (targetRain - rainIntensity) * Math.min(1, dt * 0.4);

  // Smoothly interpolate inflow rate
  const targetInflow = WEATHER_FLOW_MAP[newWeather].inflow;
  const currentInflow = state.inflowRate + (targetInflow - state.inflowRate) * Math.min(1, dt * 0.2);

  // Random thunder in storms
  if (newWeather === 'ribut_tengkujuh' && Math.random() < 0.008) {
    sound.playThunder();
  }

  // Update sound engine
  sound.updateWeatherSound(rainIntensity);

  return {
    timeOfDay: newTimeOfDay,
    weather: newWeather,
    weatherDuration: remainingDuration,
    rainIntensity,
    inflowRate: Math.round(currentInflow),
  };
}
