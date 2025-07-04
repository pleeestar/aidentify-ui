// path: /components/BackgroundController.tsx

'use client';
import React, { ReactNode } from 'react';
import styles from './BackgroundController.module.css';

interface BackgroundControllerProps {
  children: ReactNode;
}

export default function BackgroundController({ children }: BackgroundControllerProps) {
  return (
    <div className={styles.gradientContainer}>
      {children}
    </div>
  );
}