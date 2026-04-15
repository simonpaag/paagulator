import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function fetchExchangeRates(): Promise<Record<string, number>> {
  const CACHE_KEY = 'currency_rates_cache';
  const CACHE_TIME_KEY = 'currency_rates_timestamp';
  const ONE_DAY = 24 * 60 * 60 * 1000;

  try {
    const cachedRates = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
    const now = Date.now();

    if (cachedRates && cachedTime && now - parseInt(cachedTime) < ONE_DAY) {
      console.log('Using cached rates');
      return JSON.parse(cachedRates);
    }

    // Fetch from a reliable free API
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    if (!response.ok) throw new Error('Failed to fetch rates');
    
    const data = await response.json();
    const rates = data.rates;
    rates["USD"] = 1;
    
    // Cache the results
    localStorage.setItem(CACHE_KEY, JSON.stringify(rates));
    localStorage.setItem(CACHE_TIME_KEY, now.toString());
    
    return rates;
  } catch (error) {
    console.error("Error fetching rates:", error);
    const cachedRates = localStorage.getItem(CACHE_KEY);
    if (cachedRates) return JSON.parse(cachedRates);
    
    // Comprehensive fallback
    return {
      USD: 1, EUR: 0.92, GBP: 0.79, JPY: 151.42, CAD: 1.35, AUD: 1.52, 
      CHF: 0.90, CNY: 7.23, DKK: 6.85, SEK: 10.5, NOK: 10.7, INR: 83.2,
      BRL: 5.0, MXN: 16.5, ZAR: 18.9, SGD: 1.35, HKD: 7.8, NZD: 1.66
    };
  }
}
