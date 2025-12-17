export const getWeeklyStats = async (Model, page = 1, limit = 2) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const monthStart = new Date(year, month, 1, 0, 0, 0, 0);
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);

  const weeklyData = await Model.aggregate([
    {
      $match: {
        createdAt: { $gte: monthStart, $lte: monthEnd }
      }
    },
    {
      $addFields: {
        weekOfMonth: {
          $ceil: {
            $divide: [
              { $dayOfMonth: "$createdAt" },
              7
            ]
          }
        }
      }
    },
    {
      $group: {
        _id: "$weekOfMonth",
        total: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  const weekArray = [
    { week: "week1", total: 0 },
    { week: "week2", total: 0 },
    { week: "week3", total: 0 },
    { week: "week4", total: 0 },
    { week: "week5", total: 0 }
  ];

  weeklyData.forEach((item) => {
    weekArray[item._id - 1].total = item.total;
  });

  const skip = (page - 1) * limit;
  const paginated = weekArray.slice(skip, skip + limit);

  return {
    page,
    limit,
    totalWeeks: weekArray.length,
    data: paginated
  };
};
