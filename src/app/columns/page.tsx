"use server";
import React from "react";
import { getColumnPage } from "@/api/columnController";
import ColumnsPageClient from "@/components/ColumnsPageClient";
import "./styles.css";
import Sidebar from "@/components/Sidebar/page";
import "@ant-design/v5-patch-for-react-19";

const ColumnsPage = async () => {
  const initialResponse = (await getColumnPage({
    current: 1,
    pageSize: 20,
  })) as any;

  const initialData = initialResponse.data?.records || [];
  const initialTotal = initialResponse.data?.total || 0;

  return (
    <div className="columns-page">
      <div className="columns-container">
        <div className="columns-header mb-6">
          <h1>📖 专栏列表</h1>
          <p>发现优质专栏内容 ({initialTotal} 个专栏)</p>
        </div>
        <div className="page-layout">
          <div className="main-content">
            <ColumnsPageClient
              initialData={initialData}
              initialTotal={initialTotal}
            />
          </div>
          <div className="sidebar-content">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColumnsPage;
