import errorHandle from "../utils/errorHandling.js";
import MESSAGES from "../messages/message.js";
import HttpStatus from "../config/statusCode.js";
import SubCategory from "../models/subCategoryModel.js";
import Category from "../models/categoryModel.js";
import mongoose from "mongoose";

// -------------------- CREATE SUBCATEGORY --------------------
export async function createSubCategory(req, res) {
  try {
    const data = req.body;

    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(400).json({
        status: false,
        message: "Invalid category",
      });
    }

    const result = await SubCategory.create(data);
    return res.status(200).json({
      status: true,
      message: MESSAGES.SUBCATEGORY.ADD_SUCCESS,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
}

// ------------------------- UPDATE SUBCATEGORY -------------------------
export async function updateSubCategory(req, res) {
  try {
    const { id } = req.params;
    const result = await SubCategory.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!result) {
      return res.status(400).json({
        status: false,
        message: MESSAGES.SUBCATEGORY.NOT_FOUND,
      });
    }
    return res.status(200).json({
      status: true,
      message: MESSAGES.SUBCATEGORY.UPDATE_SUCCESS,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
}

// -------------------- DELETE CATEGORY --------------------
export async function deleteCategory(req, res) {
  try {
    const { id } = req.params;

    const result = await SubCategory.findByIdAndDelete(id);

    if (!result) {
      throw new errorHandle(
        HttpStatus.BAD_REQUEST,
        MESSAGES.SUBCATEGORY.NOT_FOUND
      );
    }

    return res.status(200).json({
      status: true,
      message: MESSAGES.SUBCATEGORY.DELETE_SUCCESS,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
}

//----------------------------- GET ALL SUB-CATEGORY -------------------------------

export async function getAllSubCategory(req, res) {
  try {
    const find = await SubCategory.find({});

    if (find) {
      const result = await SubCategory.aggregate([
        {
          $lookup: {
            from: "categories",
            let: { catId: "$category" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$catId"] },
                },
              },
              { $project: { _id: 1, name: 1, slug: 1 } },
            ],
            as: "categoryObj",
          },
        },
        { $unwind: { path: "$categoryObj", preserveNullAndEmptyArrays: true } },

        {
          $lookup: {
            from: "products",
            let: { subId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$subCategory", "$$subId"] },
                },
              },
              {
                $project: {
                  _id: 1,
                  title: 1,
                  images: 1,
                  price: 1,
                },
              },
            ],
            as: "productObj",
          },
        },

        { $unwind: { path: "$productObj", preserveNullAndEmptyArrays: true } },

        {
          $project: {
            _id: 1,
            name: 1,
            slug: 1,
            category: {
              id: "$categoryObj._id",
              name: "$categoryObj.name",
              slug: "$categoryObj.slug",
            },
            products: {
              id: "$productObj._id",
              name: "$productObj.title",
              image: "$productObj.images",
              price: "$productObj.price",
            },
          },
        },
      ]);

      return res.status(200).json({
        status: true,
        message: "category fetched successfully.",
        count: result.length,
        data: result,
      });
    } else {
      return res.status(400).json({
        status: false,
        message: MESSAGES.SUBCATEGORY.NOT_FOUND,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
}

//----------------------------- GET SUB-CATEGORY BY ID -------------------------------
export async function getSubCategoryById(req, res) {
  try {
    const { id } = req.params;

    const result = await SubCategory.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },

      {
        $lookup: {
          from: "categories",
          let: { catId: "$category" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$catId"] },
              },
            },
            { $project: { _id: 1, name: 1, slug: 1 } },
          ],
          as: "categoryObj",
        },
      },
      { $unwind: { path: "$categoryObj", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "products",
          let: { subId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$subCategory", "$$subId"] },
              },
            },
            {
              $project: {
                _id: 1,
                title: 1,
                images: 1,
                price: 1,
              },
            },
          ],
          as: "productObj",
        },
      },

      { $unwind: { path: "$productObj", preserveNullAndEmptyArrays: true } },

      {
        $project: {
          _id: 1,
          name: 1,
          slug: 1,
          category: {
            id: "$categoryObj._id",
            name: "$categoryObj.name",
            slug: "$categoryObj.slug",
          },
          products: {
            id: "$productObj._id",
            name: "$productObj.title",
            image: "$productObj.images",
            price: "$productObj.price",
          },
        },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "category fetched successfully.",
      count: result.length,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
}

// ---------------------- SEARCH SUBCATEGORY BY NAME --------------------
export async function searchSubCategoryByName(req, res) {
  try {
    const { slug } = req.params;

    const result = await SubCategory.aggregate([
      { $match: { slug: slug } },

      {
        $lookup: {
          from: "categories",
          let: { catId: "$category" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$catId"] },
              },
            },
            { $project: { _id: 1, name: 1, slug: 1 } },
          ],
          as: "categoryObj",
        },
      },
      { $unwind: { path: "$categoryObj", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "products",
          let: { subId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$subCategory", "$$subId"] },
              },
            },
            {
              $project: {
                _id: 1,
                title: 1,
                images: 1,
                price: 1,
              },
            },
          ],
          as: "productObj",
        },
      },

      { $unwind: { path: "$productObj", preserveNullAndEmptyArrays: true } },

      {
        $project: {
          _id: 1,
          name: 1,
          slug: 1,
          category: {
            id: "$categoryObj._id",
            name: "$categoryObj.name",
            slug: "$categoryObj.slug",
          },
          products: {
            id: "$productObj._id",
            name: "$productObj.title",
            image: "$productObj.images",
            price: "$productObj.price",
          },
        },
      },
      // {
      //   project: {
      //     _id: 1,
      //     name: 1,
      //     slug: 1,
      //     products: {
      //       id: "$productObj._id",
      //       name: "$productObj.name",
      //       image: "$productObj.image",
      //       price: "$productObj.price",
      //     }
      //   }
      // }
    ]);

    return res.status(200).json({
      status: true,
      message: "category fetched successfully.",
      count: result.length,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
}

// ---------------------- FIND BY CATEGORY ID ------------------------------
export async function findByCategoryId(req, res) {
  try {
    const { id } = req.params;

    const result = await SubCategory.aggregate([
      { $match: { category: new mongoose.Types.ObjectId(id) } },

      {
        $lookup: {
          from: "categories",
          let: { catId: "$category" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$catId"] },
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                slug: 1,
              },
            },
          ],
          as: "categoryObj",
        },
      },
      { $unwind: { path: "$categoryObj", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "products",
          let: { subId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$subCategory", "$$subId"] },
              },
            },
            {
              $project: {
                _id: 1,
                title: 1,
                images: 1,
                price: 1,
              },
            },
          ],
          as: "productObj",
        },
      },

      { $unwind: { path: "$productObj", preserveNullAndEmptyArrays: true } }, 
      {
        $project: {
          _id: 1,
          name: 1,
          slug: 1,
          category: {
            id: "$categoryObj._id",
            name: "$categoryObj.name",
            slug: "$categoryObj.slug",
          },
          products: {
            id: "$productObj._id",
            title: "$productObj.title",
            image: "$productObj.images",
            price: "$productObj.price",
          },
        },
      },

      {
        $group: {
          _id: "$category.id",
          category: { $first: "$category" },
          subCategories: {
            $push: {
              id: "$_id",
              name: "$name",
              slug: "$slug",
              products: "$products",
            },
          },
        },
      },

      {
        $project: {
          _id: 0,
          category: 1,
          subCategories: 1,
        },
      },

      // {
      //   $lookup: {
      //     from: "products",
      //     localField: "_id",
      //     foreignField: "subCategory",
      //     as: "products"
      //   }
      // },
    ]);

    return res.status(200).json({
      status: true,
      message: "subCategory fetched successfully.",
      count: result.length,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
}
