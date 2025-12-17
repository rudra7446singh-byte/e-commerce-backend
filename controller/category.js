// import { create, findByIdAndUpdate, findByIdAndDelete, find, findOneAndUpdate } from "../models/categoryModel";
import errorHandle from "../utils/errorHandling.js";
import MESSAGES from "../messages/message.js";
// import { CREATED, INTERNAL_SERVER_ERROR, BAD_REQUEST, OK } from "../config/statusCode.js";
import HttpStatus from "../config/statusCode.js";
import Category from "../models/categoryModel.js";
import { category } from "./index.js";
import mongoose from "mongoose";

// -------------------- CREATE CATEGORY --------------------
export async function createCategory(req, res) {
  try {
    const result = await Category.create(req.body);
    return res.status(200).json({
      status: true,
      message: MESSAGES.CATEGORY.CREATE_SUCCESS,
      data: result,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        status: false,
        message: "Category name already exists. Please choose another name.",
      });
    }

    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
}

// -------------------- UPDATE CATEGORY --------------------
export async function updateCategory(req, res) {
  try {
    const { id } = req.params;

    const result = await Category.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!result) {
      throw new errorHandle(
        HttpStatus.BAD_REQUEST,
        MESSAGES.CATEGORY.NOT_FOUND
      );
    }

    return res.status(200).json({
      status: true,
      message: MESSAGES.CATEGORY.UPDATE_SUCCESS,
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

    const result = await Category.findByIdAndDelete(id);

    if (!result) {
      throw new errorHandle(
        HttpStatus.BAD_REQUEST,
        MESSAGES.CATEGORY.NOT_FOUND
      );
    }

    return res.status(200).json({
      status: true,
      message: MESSAGES.CATEGORY.DELETE_SUCCESS,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
}

// -------------------- GET ALL CATEGORIES --------------------
export async function getCategories(req, res) {
  try {
    const result = await Category.aggregate([
      {
        $lookup: {
          from: "subcategories",
          let: { categoryId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$category", "$$categoryId"] },
              },
            },
            { $project: { _id: 1, name: 1, slug: 1 } },
          ],
          as: "subCategories",
        },
      },

      { $unwind: { path: "$subCategories", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "products",
          let: { categoryId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$category", "$$categoryId"] },
              },
            },
            { $project: { _id: 1, title: 1, image: 1, price: 1 } },
          ],
          as: "products",
        },
      },

      { $unwind: { path: "$products", preserveNullAndEmptyArrays: true } },

      {
        $project: {
          _id: 1,
          name: 1,
          slug: 1,
          subCategories: {
            _id: "$subCategories._id",
            name: "$subCategories.name",
            slug: "$subCategories.slug",
          },
          products: {
            _id: "$products._id",
            name: "$products.title",
            price: "$products.price",
            image: "$products.image",
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

// ---------------------- get category by id --------------------
export async function getCategoryById(req, res) {
  try {
    const { id } = req.params;

    const result = await Category.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },

      {
        $lookup: {
          from: "subcategories",
          let: { categoryId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$category", "$$categoryId"] },
              },
            },
            { $project: { _id: 1, name: 1, slug: 1 } },
          ],
          as: "subCategories",
        },
      },

      { $unwind: { path: "$subCategories", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "products",
          let: { categoryId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$category", "$$categoryId"] },
              },
            },
            { $project: { _id: 1, title: 1, image: 1, price: 1 } },
          ],
          as: "products",
        },
      },

      { $unwind: { path: "$products", preserveNullAndEmptyArrays: true } },

      {
        $project: {
          _id: 1,
          name: 1,
          slug: 1,
          subCategories: {
            _id: "$subCategories._id",
            name: "$subCategories.name",
            slug: "$subCategories.slug",
          },
          products: {
            _id: "$products._id",
            name: "$products.title",
            price: "$products.price",
            image: "$products.image",
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

// ------------------------- GET CATEGORY BY SLUG -----------------------------
export async function getCategoryBySlug(req, res) {
  try {
    const { slug } = req.params;

    const result = await Category.aggregate([
      { $match: { slug: slug } },

      {
        $lookup: {
          from: "subcategories",
          let: { categoryId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$category", "$$categoryId"] },
              },
            },
            { $project: { _id: 1, name: 1, slug: 1 } },
          ],
          as: "subCategories",
        },
      },

      { $unwind: { path: "$subCategories", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "products",
          let: { categoryId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$category", "$$categoryId"] },
              },
            },
            { $project: { _id: 1, title: 1, image: 1, price: 1 } },
          ],
          as: "products",
        },
      },

      { $unwind: { path: "$products", preserveNullAndEmptyArrays: true } },

      {
        $project: {
          _id: 1,
          name: 1,
          slug: 1,
          subCategories: {
            _id: "$subCategories._id",
            name: "$subCategories.name",
            slug: "$subCategories.slug",
          },
          products: {
            _id: "$products._id",
            name: "$products.title",
            price: "$products.price",
            image: "$products.image",
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

// -------------------- DELETE SUBCATEGORY --------------------
// export async function deleteSubCategory(req, res) {
//   try {
//     const { subCategoryId } = req.params;

//     const result = await Category.findOneAndUpdate(
//       { "subCategory._id": subCategoryId },
//       { $pull: { subCategory: { _id: subCategoryId } } },
//       { new: true }
//     );

//     if (!result) {
//       throw new errorHandle(HttpStatus.BAD_REQUEST,MESSAGES.CATEGORY.NOT_FOUND);
//     }

//     return res.status(200).json({
//       status: true,
//       message: MESSAGES.CATEGORY.SUBCATEGORY_DELETED,
//       data: result,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       status: false,
//       message: error.message,
//     });
//   }
// }
