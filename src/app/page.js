'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../styles/Home.module.css';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page
    router.push('/auth/login');
  }, [router]);

  return (
    <div className={styles.container}>
      <div className={styles.loader}>
        <div className="loading"></div>
        <p>Loading...</p>
      </div>
    </div>
  );
}
