import { NextResponse } from 'next/server';
import { getWeeklyForecast } from '@/services/forecastService';
import { WeeklyForecast } from '@/types/forecast';

// Implement a simple in-memory cache for quick responses
let cachedForecast: WeeklyForecast | null = null;
let cacheTime: number = 0;
const CACHE_DURATION = 60 * 1000; // 1 minute

export async function GET() {
  try {
    // Check if we have a valid cache
    const now = Date.now();
    if (cachedForecast && now - cacheTime < CACHE_DURATION) {
      // Return cached data with cache headers
      return NextResponse.json(cachedForecast, {
        headers: {
          'Cache-Control': 'public, max-age=60',
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Fetch fresh data
    const data = await getWeeklyForecast();
    
    // Update cache
    cachedForecast = data;
    cacheTime = now;
    
    // Return response with cache headers
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=60',
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Prefetch API error:', error);
    return NextResponse.json({ error: 'Failed to fetch forecast data' }, { status: 500 });
  }
} 