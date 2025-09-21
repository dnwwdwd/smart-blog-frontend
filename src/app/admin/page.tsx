'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminIndexRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/dashboard');
  }, [router]);
  return null;
}