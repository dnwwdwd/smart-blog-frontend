"use client";

import React, { useMemo, useState } from "react";
import { Tabs, Empty, Button } from "antd";
import {
  AppstoreOutlined,
  FireOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import ColumnCard from "@/components/ColumnCard/page";
import "./styles.css";

type ColumnTabsProps = {
  initialColumns: API.ColumnVo[];
  initialTotal: number;
};

type TabKey = "latest" | "popular" | "alphabet";

const sortColumns = (columns: API.ColumnVo[], key: TabKey) => {
  const cloned = [...columns];
  switch (key) {
    case "popular":
      return cloned.sort(
        (a, b) => (b.articleCount || 0) - (a.articleCount || 0)
      );
    case "alphabet":
      return cloned.sort((a, b) =>
        (a.name || "").localeCompare(b.name || "", "zh-Hans-CN")
      );
    case "latest":
    default:
      return cloned.sort(
        (a, b) =>
          new Date(b.createTime || 0).getTime() -
          new Date(a.createTime || 0).getTime()
      );
  }
};

const tabMeta: Record<TabKey, { label: React.ReactNode; icon: React.ReactNode }> = {
  latest: {
    label: "最新上架",
    icon: <ClockCircleOutlined />,
  },
  popular: {
    label: "热门专栏",
    icon: <FireOutlined />,
  },
  alphabet: {
    label: "按名称排序",
    icon: <AppstoreOutlined />,
  },
};

const renderTabLabel = (key: TabKey) => (
  <span className="column-tab-label">
    {tabMeta[key].icon}
    <span>{tabMeta[key].label}</span>
  </span>
);

const ColumnTabs: React.FC<ColumnTabsProps> = ({ initialColumns, initialTotal }) => {
  const [activeKey, setActiveKey] = useState<TabKey>("latest");

  const sortedColumns = useMemo(
    () => sortColumns(initialColumns, activeKey),
    [initialColumns, activeKey]
  );

  return (
    <div className="column-tabs-card">
      <div className="column-tabs-header">
        <div>
          <h3>精选专栏</h3>
          <p className="column-tabs-subtitle">共 {initialTotal} 个专栏</p>
        </div>
        <Link href="/columns" prefetch={false}>
          <Button type="link" icon={<ArrowRightOutlined />}>
            查看更多
          </Button>
        </Link>
      </div>

      <Tabs
        activeKey={activeKey}
        onChange={(key) => setActiveKey(key as TabKey)}
        items={(Object.keys(tabMeta) as TabKey[]).map((key) => ({
          key,
          label: renderTabLabel(key),
          children:
            sortedColumns.length === 0 ? (
              <Empty description="暂无专栏" className="column-tabs-empty" />
            ) : (
              <div className="column-tabs-grid">
                {sortedColumns.map((column) => (
                  <ColumnCard key={column.id} column={column} />
                ))}
              </div>
            ),
        }))}
      />
    </div>
  );
};

export default ColumnTabs;
