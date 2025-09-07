import dayjs from "dayjs";

export const formatDate = (date: string | Date | number) => {
  return dayjs(date).format("YYYY-MM-DD");
};

export const formatDateTime = (date: string | Date | number) => {
  return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
};
