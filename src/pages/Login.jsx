import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const PREDEFINED_AVATARS = [
  // Custom
  { name: 'Galala', url: '/galala.jpg' },
  { name: 'Essam', url: '/essam.jpg' },
  { name: 'Shehab', url: '/shehab.jpg' },
  { name: 'Iron Man', url: '/ironman.jpg' },
  { name: 'Rapunzel', url: '/rapunzel.jpg' },
  // Footballers
  { name: 'Lionel Messi', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Lionel_Messi_NE_Revolution_Inter_Miami_7.9.25-055.jpg/330px-Lionel_Messi_NE_Revolution_Inter_Miami_7.9.25-055.jpg' },
  { name: 'Cristiano Ronaldo', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Cristiano_Ronaldo_2275_%28cropped%29.jpg/330px-Cristiano_Ronaldo_2275_%28cropped%29.jpg' },
  { name: 'Erling Haaland', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Erling_Haaland_Morocco_v_Norway_7_June_2026-51.jpg/330px-Erling_Haaland_Morocco_v_Norway_7_June_2026-51.jpg' },
  { name: 'Michael Olise', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Michael_Olise_France_v_Senegal_16_June_2026-307_%28cropped%29.jpg/330px-Michael_Olise_France_v_Senegal_16_June_2026-307_%28cropped%29.jpg' },
  { name: 'Ronaldo R9', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Ronaldo_Lu%C3%ADs_Naz%C3%A1rio_de_Lima_2019_%283x4_cropped%29.jpg/330px-Ronaldo_Lu%C3%ADs_Naz%C3%A1rio_de_Lima_2019_%283x4_cropped%29.jpg' },
  { name: 'Ronaldinho', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/2019_-_Press_conferences_-_Day_1_ENX_6950_%2849019873887%29_%28cropped%29.jpg/330px-2019_-_Press_conferences_-_Day_1_ENX_6950_%2849019873887%29_%28cropped%29.jpg' },
  { name: 'Diego Maradona', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Argentina_celebrando_copa_%28cropped%29.jpg/330px-Argentina_celebrando_copa_%28cropped%29.jpg' },
  { name: 'Pelé', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Pele_con_brasil_%28cropped%29.jpg/330px-Pele_con_brasil_%28cropped%29.jpg' },
  { name: 'Zinedine Zidane', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Zinedine_Zidane_by_Tasnim_03.jpg/330px-Zinedine_Zidane_by_Tasnim_03.jpg' },
  { name: 'Roberto Baggio', url: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Roberto_Baggio_-_Italia_%2790.jpg' },
  { name: 'Francesco Totti', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/KL-2018_%284%29.jpg/330px-KL-2018_%284%29.jpg' },
  { name: 'Mohamed Aboutrika', url: 'https://upload.wikimedia.org/wikipedia/commons/f/f4/Aboutrika2011.jpg' },
  // Disney / Characters
  { name: 'Mickey Mouse', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Mickey_Mouse_%28poster_version%29.svg/330px-Mickey_Mouse_%28poster_version%29.svg.png' },
  { name: 'Minnie Mouse', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Minnie_Mouse.svg/330px-Minnie_Mouse.svg.png' },
  { name: 'Elsa (Frozen)', url: 'https://upload.wikimedia.org/wikipedia/en/5/5e/Elsa_from_Disney%27s_Frozen.png' },
  { name: 'Ariel', url: 'https://upload.wikimedia.org/wikipedia/en/7/77/Ariel_disney.png' },
  { name: 'Cinderella', url: 'https://upload.wikimedia.org/wikipedia/en/7/75/Cinderella2024design.png' },
  { name: 'Moana', url: 'https://upload.wikimedia.org/wikipedia/en/5/56/Moana_%28character%29.png' },
  { name: 'Jasmine', url: 'https://upload.wikimedia.org/wikipedia/en/0/00/Jasmine_%28Aladdin%29.png' },
  { name: 'Spider-Man', url: 'https://upload.wikimedia.org/wikipedia/en/2/21/Web_of_Spider-Man_Vol_1_129-1.png' },
  { name: 'Thor', url: 'https://upload.wikimedia.org/wikipedia/en/3/3c/Chris_Hemsworth_as_Thor.jpg' }
];

export default function Login() {
  const [leagueCode, setLeagueCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (leagueCode !== 'WC2026') {
      setError('Invalid League Code.');
      setLoading(false);
      return;
    }

    if (!displayName.trim()) {
      setError('Username is required.');
      setLoading(false);
      return;
    }

    // Generate dummy credentials based on the username to satisfy Supabase Auth
    const dummyEmail = `${displayName.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}@wc2026.com`;
    const dummyPassword = 'LeagueWC2026Password!';

    try {
      // Try to log in first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: dummyEmail,
        password: dummyPassword,
      });

      if (signInError) {
        // If login fails (user doesn't exist), try to sign up
        const { error: signUpError } = await supabase.auth.signUp({
          email: dummyEmail,
          password: dummyPassword,
          options: {
            data: {
              display_name: displayName.trim(),
              avatar_url: avatarUrl.trim(),
            }
          }
        });

        if (signUpError) {
          throw signUpError;
        }
      }
      
      // If login or signup succeeds, navigate to home
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '2rem 0' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--accent-color)' }}>
          Enter the League
        </h2>
        
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger-color)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid var(--danger-color)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input 
            type="text" 
            placeholder="League Code (e.g., WC2026)" 
            value={leagueCode}
            onChange={(e) => setLeagueCode(e.target.value)}
            required
          />
          <input 
            type="text" 
            placeholder="Username" 
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
          
          <div style={{ marginTop: '0.5rem' }}>
            <p style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>Choose your Avatar:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', padding: '0.5rem', justifyContent: 'center' }}>
              {PREDEFINED_AVATARS.map((avatar) => (
                <img 
                  key={avatar.name}
                  src={avatar.url} 
                  alt={avatar.name}
                  title={avatar.name}
                  onClick={() => setAvatarUrl(avatar.url)}
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    objectPosition: 'center top',
                    cursor: 'pointer',
                    border: avatarUrl === avatar.url ? '3px solid var(--accent-color)' : '3px solid transparent',
                    transition: 'all 0.2s',
                    flexShrink: 0
                  }}
                />
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? 'Entering...' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  );
}
