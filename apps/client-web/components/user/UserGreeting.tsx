'use client';

import { useEffect, useState } from 'react';
import { userService, UserResponse } from '@/services/user';

export default function UserGreeting() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true);
        const data = await userService.getCurrentUser();
        setUser(data);
      } catch (err) {
        setError('Failed to fetch user data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 rounded-lg">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-100 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-blue-100 rounded-lg">
      <h2 className="text-2xl font-bold text-blue-900 mb-2">
        Hello, {user?.name}! 👋
      </h2>
      <p className="text-blue-700">{user?.message}</p>
    </div>
  );
}