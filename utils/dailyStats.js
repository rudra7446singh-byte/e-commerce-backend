export const getDailyStats = async (Model, page = 1, limit = 7) => {
  const now = new Date();

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const daysArray = [
    "Sunday", "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday"
  ];

  const rawData = await Model.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfWeek, $lte: endOfWeek }
      }
    },
    {
      $group: {
        _id: { $dayOfWeek: "$createdAt" },
        count: { $sum: 1 }
      }
    }
  ]);

  const fullWeek = daysArray.map((day, index) => {
    const mongoDayNumber = index + 1;
    const found = rawData.find(item => item._id === mongoDayNumber);

    return {
      day: day,
      count: found ? found.count : 0
    };
  });

  const skip = (page - 1) * limit;
  const paginated = fullWeek.slice(skip, skip + limit);

  return paginated;
};
