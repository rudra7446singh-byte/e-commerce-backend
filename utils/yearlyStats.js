export const getYearlyStats = async (Model, page = 1, limit = 4) => {
  const skip = (page - 1) * limit;

  const data = await Model.aggregate([
    {
      $group: {
        _id: { year: { $year: "$createdAt" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id.year": -1 } }
  ]);

  const minYear = 2020;
  const maxYear = new Date().getFullYear();
  const allYears = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);

  const padded = allYears.map(year => {
    const found = data.find(d => d._id.year === year);
    return { year, count: found ? found.count : 0 };
  });

  const paged = padded.slice(skip, skip + limit);

  return paged;
};
