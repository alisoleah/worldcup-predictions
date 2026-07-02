import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ShieldAlert, Save, LogOut } from 'lucide-react';
import { getFlag } from '../lib/flags';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(null); // match id being saved

  // To update API locally when doing `npm run dev`, Vite doesn't natively run `/api/` 
  // so for local dev, this might fail unless they run `vercel dev`.
  // However, it will work perfectly on production Vercel.
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchMatches();
    }
  }, [isAuthenticated]);

  const fetchMatches = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('matches')
      .select('*')
      .order('start_time', { ascending: true });
    
    if (data) setMatches(data);
    setLoading(false);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin1234') {
      setIsAuthenticated(true);
    } else {
      alert('Invalid credentials');
    }
  };

  const handleUpdateMatch = async (matchId) => {
    const matchData = matches.find(m => m.id === matchId);
    setSaving(matchId);
    
    try {
      const res = await fetch('/api/adminUpdateMatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin1234',
          matchData
        })
      });
      
      const result = await res.json();
      
      if (res.ok && result.success) {
        alert('Match updated successfully!');
      } else {
        alert('Failed to update match: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Error updating match. Note: If testing locally with "npm run dev", the /api folder is not running unless you use Vercel CLI.');
    } finally {
      setSaving(null);
    }
  };

  const handleChange = (matchId, field, value) => {
    setMatches(prev => prev.map(m => {
      if (m.id === matchId) {
        // Parse numbers for scores
        let finalValue = value;
        if ((field === 'home_score' || field === 'away_score') && value !== '') {
          finalValue = parseInt(value);
        }
        return { ...m, [field]: finalValue };
      }
      return m;
    }));
  };

  if (!isAuthenticated) {
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="glass-panel" style={{ padding: '3rem', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <ShieldAlert size={48} color="var(--danger-color)" style={{ marginBottom: '1.5rem' }} />
          <h1 style={{ marginBottom: '2rem' }}>Admin Access</h1>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="text" 
              placeholder="Username" 
              className="input-field"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
            <input 
              type="password" 
              placeholder="Password" 
              className="input-field"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary" style={{ marginTop: '1rem', background: 'var(--danger-color)' }}>
              Login to Admin
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger-color)' }}>
          <ShieldAlert size={28} /> Admin Dashboard
        </h1>
        <button onClick={() => setIsAuthenticated(false)} style={{ background: 'transparent', border: '1px solid var(--surface-border)', color: 'var(--text-primary)', padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <LogOut size={16} /> Exit Admin
        </button>
      </header>

      <div className="glass-panel">
        <h2 style={{ marginBottom: '1.5rem' }}>Edit Matches (Manual Override)</h2>
        <p style={{ color: 'var(--warning-color)', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Warning: The automated cron job might overwrite your changes if the match is still active in the ESPN API.
        </p>

        {loading ? (
          <p>Loading matches...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Match Teams</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Home Score</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Away Score</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {matches.map(match => (
                  <tr key={match.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.25rem' }}>{getFlag(match.home_team)}</span>
                          <input 
                            value={match.home_team} 
                            onChange={(e) => handleChange(match.id, 'home_team', e.target.value)}
                            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--surface-border)', color: 'white', padding: '0.25rem', borderRadius: '4px', width: '120px' }}
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.25rem' }}>{getFlag(match.away_team)}</span>
                          <input 
                            value={match.away_team} 
                            onChange={(e) => handleChange(match.id, 'away_team', e.target.value)}
                            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--surface-border)', color: 'white', padding: '0.25rem', borderRadius: '4px', width: '120px' }}
                          />
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <input 
                        type="number"
                        value={match.home_score ?? ''} 
                        onChange={(e) => handleChange(match.id, 'home_score', e.target.value)}
                        style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--surface-border)', color: 'white', padding: '0.5rem', borderRadius: '4px', width: '60px', textAlign: 'center' }}
                      />
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <input 
                        type="number"
                        value={match.away_score ?? ''} 
                        onChange={(e) => handleChange(match.id, 'away_score', e.target.value)}
                        style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--surface-border)', color: 'white', padding: '0.5rem', borderRadius: '4px', width: '60px', textAlign: 'center' }}
                      />
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <select 
                        value={match.status}
                        onChange={(e) => handleChange(match.id, 'status', e.target.value)}
                        style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--surface-border)', color: 'white', padding: '0.5rem', borderRadius: '4px' }}
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="live">Live</option>
                        <option value="finished">Finished</option>
                      </select>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleUpdateMatch(match.id)}
                        disabled={saving === match.id}
                        style={{ background: 'var(--success-color)', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                      >
                        <Save size={16} /> {saving === match.id ? 'Saving...' : 'Save'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
