export const getMonthlyStats = async (Model, page = 1, limit = 4) => {
  const now = new Date();
  const year = now.getFullYear();

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const monthArray = [];

  for (let i = 0; i < 12; i++) {
    const start = new Date(year, i, 1);
    const end = new Date(year, i + 1, 1);

    const count = await Model.countDocuments({
      createdAt: { $gte: start, $lte: end }
    });

    monthArray.push({
      month: months[i],
      total: count
    });
  }

  const skip = (page - 1) * limit;
  const paginated = monthArray.slice(skip, skip + limit);

  return {
    totalMonths: monthArray.length,
    data: paginated
  };
};
