const validateDateRange = (
  startDate: string | Date,
  endDate: string | Date,
) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const diffInMs = end.getTime() - start.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  return diffInDays >= 21;
};
export default validateDateRange;
