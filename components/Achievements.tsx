'use client';

import { useEffect, useState } from 'react';
import { Achievement } from '@/lib/portfolio-data';
import AchievementsClient from './AchievementsClient';

const Achievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/portfolio');
        const data = await response.json();
        setAchievements(data.achievements || []);
      } catch (error) {
        console.error('Failed to fetch achievements data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </section>
    );
  }

  // Only show section if there are achievements/certificates
  if (!achievements || achievements.length === 0) {
    return null;
  }

  return (
    <AchievementsClient achievements={achievements} />
  );
};

export default Achievements;
