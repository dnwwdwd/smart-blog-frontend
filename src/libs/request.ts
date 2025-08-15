import axios from "axios";
import { message } from "antd";

// 创建 Axios 示例
const myAxios = axios.create({
  baseURL: "http://localhost:8888/api",
  timeout: 10000,
  withCredentials: true,
});

// 创建请求拦截器
myAxios.interceptors.request.use(
  function (config) {
    // 请求执行前执行
    return config;
  },
  function (error) {
    // 处理请求错误
    return Promise.reject(error);
  }
);

// 创建响应拦截器
myAxios.interceptors.response.use(
  // 2xx 响应触发
  function (response) {
    // 处理响应数据
    const { data } = response;
    if (data.code !== 0) {
      // 只在客户端环境中显示错误消息
      if (typeof window !== "undefined") {
        message.error(data.message);
      } else {
        console.log("API Error:", data.message);
      }
    }
    return data;
  },
  // 非 2xx 响应触发
  function (error) {
    // 处理响应错误
    return Promise.reject(error);
  }
);

export default myAxios;
