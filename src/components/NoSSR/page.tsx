import dynamic from 'next/dynamic';
import React from 'react';
import './styles.css';

interface NoSSRProps {
  children: React.ReactNode;
}

const NoSSR: React.FC<NoSSRProps> = ({ children }) => {
  return <>{children}</>;
};

export default dynamic(() => Promise.resolve(NoSSR), {
  ssr: false,
});