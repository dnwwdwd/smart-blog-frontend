'use client';

import React from 'react';
import ColumnCard from '@/components/ColumnCard/page';
import { useColumnsData } from '@/components/ColumnsPageClient';

const ColumnListClient: React.FC = () => {
  const { data: columns, loading } = useColumnsData();

  return (
    <div className="columns-grid">
      {columns.map((column) => (
        <ColumnCard key={column.id} column={column} />
      ))}
    </div>
  );
};

export default ColumnListClient;