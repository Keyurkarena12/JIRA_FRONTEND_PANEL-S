import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

const AuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('access_token') || params.get('token');

      if (!token) {
        navigate('/login', { replace: true });
        return;
      }

      try {
        const res = await apiClient.get(ENDPOINTS.auth.user, {
          headers: { Authorization: `Bearer ${token}` },
        });
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/', { replace: true });
      } catch (error) {
        console.error('error fetching user', error);
        navigate('/login', { replace: true });
      }
    };

    fetchUser();
  }, [navigate]);

  return (
    <div className="text-center py-12">
      <div className="inline-block w-10 h-10 border-2 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-[var(--text-secondary)]">Completing sign in…</p>
    </div>
  );
};

export default AuthSuccess;
