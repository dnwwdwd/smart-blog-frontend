import dayjs from "dayjs";

export const formatDateTime = (date: Date) => {
  return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
};
