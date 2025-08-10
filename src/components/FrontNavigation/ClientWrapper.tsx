'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import FrontNavigation from './page';

const FrontNavigationClientWrapper: React.FC = () => {
  const pathname = usePathname();
  return <FrontNavigation currentPath={pathname} />;
};

export default FrontNavigationClientWrapper;