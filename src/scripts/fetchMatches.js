import { createClient } from '@supabase/supabase-js';

// This script is meant to be run periodically (e.g., via a cron job on Vercel or Supabase Edge Functions)
// It fetches matches from an external API (like API-Football) and updates the Supabase database.

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function syncMatches() {
  console.log('Fetching matches from external API...');
  
  try {
    // Note: This is a placeholder for the actual API call.
    // For example, if using api-football:
    // const res = await fetch('https://v3.football.api-sports.io/fixtures?league=4&season=2026', {
    //   headers: { 'x-apisports-key': FOOTBALL_API_KEY }
    // });
    // const data = await res.json();
    
    // Mocking response data
    const mockData = [
      { id: 'uuid-1', homeTeam: 'Brazil', awayTeam: 'Argentina', startTime: new Date(Date.now() + 86400000).toISOString(), homeScore: null, awayScore: null, status: 'scheduled' },
      { id: 'uuid-2', homeTeam: 'France', awayTeam: 'Germany', startTime: new Date(Date.now() - 3600000).toISOString(), homeScore: 2, awayScore: 1, status: 'finished' }
    ];

    console.log(`Found ${mockData.length} matches. Updating database...`);

    for (const match of mockData) {
      const { error } = await supabase
        .from('matches')
        .upsert({
          -- id: match.id, // Usually you map the external API ID to your ID or store external_id
          home_team: match.homeTeam,
          away_team: match.awayTeam,
          start_time: match.startTime,
          home_score: match.homeScore,
          away_score: match.awayScore,
          status: match.status
        }, { onConflict: 'home_team,away_team' }); // Requires unique constraint on teams or storing external_id

      if (error) {
        console.error(`Error updating match ${match.homeTeam} vs ${match.awayTeam}:`, error);
      }
    }

    console.log('Sync complete.');
  } catch (error) {
    console.error('Failed to sync matches:', error);
  }
}

syncMatches();
