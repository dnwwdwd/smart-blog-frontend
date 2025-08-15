import dayjs from "dayjs";

export const formatDate = (date: Date) => {
  return dayjs(date).format("YYYY-MM-DD");
};

export const formatDateTime = (date: Date) => {
  return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
};
