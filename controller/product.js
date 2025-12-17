import errorHandle from "../utils/errorHandling.js";
import MESSAGES from "../messages/message.js";
import HttpStatus from "../config/statusCode.js";
import Product from "../models/productModel.js";
import ROLE_STATUS from "../config/constant.js";
import Category from "../models/categoryModel.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import fs from "fs";
import SubCategory from "../models/subCategoryModel.js";
import slugify from "slugify";
import mongoose from "mongoose";
import { count } from "console";

// -------------------- CREATE PRODUCT --------------------
export const createProduct = async (req, res) => {
  try {
    const user = req.user;
    const data = req.body;

    // ---------------------------------------
    // 1. Validate category
    // ---------------------------------------
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(400).json({
        status: false,
        message: "Invalid category",
      });
    }

    // ---------------------------------------
    // 2. Validate that subCategory belongs to that category
    // ---------------------------------------
    const subCategory = await SubCategory.findById(req.body.subCategory);
    if (!subCategory) {
      return res.status(400).json({
        status: false,
        message: "Invalid Sub-Category",
      });
    }

    // console.log("--------------------subCategory", checkSubCategory);

    if (subCategory.length === 0) {
      return res.status(400).json({
        status: false,
        message: "Invalid subCategory for this category",
      });
    }

    // ---------------------------------------
    // 3. Handle Image Uploads correctly
    // ---------------------------------------
    const files = req.files || []; // upload.array() always fills this

    // const imageArray = files.map((file) => ({
    //   filename: file.originalname,
    //   path: file.path,
    //   mimetype: file.mimetype,
    //   size: file.size,
    // }));
    let media = [];

    for (const file of files) {
      const uploaded = await uploadOnCloudinary(file);
      if (uploaded) {
        media.push(uploaded.secure_url);
      }
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }

    // ---------------------------------------
    // 4. Create Product object
    // ---------------------------------------
    const product = new Product({
      title: data.title,
      description: data.description,
      slug: data.slug ? data.slug : slugify(data.title, { lower: true }),
      price: data.price,
      category: req.body.category,
      subCategory: req.body.subCategory,
      images: media,
      owner: user._id,
    });

    // ---------------------------------------
    // 5. Admin auto-approval
    // ---------------------------------------
    if (user.role === ROLE_STATUS.ROLE.ADMIN) {
      product.status = ROLE_STATUS.STATUS.ACCEPTED;
    }

    // ---------------------------------------
    // 6. Save Product
    // ---------------------------------------
    await product.save();

    return res.status(200).json({
      status: true,
      message: "Product created successfully!",
      data: product,
    });
  } catch (error) {
    // console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Product creation failed",
    });
  }
};

// -------------------- GET ALL PRODUCTS --------------------
export const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const basePipeline = [
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categories",
        },
      },
      { $unwind: { path: "$categories", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "subcategories",
          localField: "subCategory",
          foreignField: "_id",
          as: "subCategories",
        },
      },
      { $unwind: { path: "$subCategories", preserveNullAndEmptyArrays: true } },

      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          slug: 1,
          price: 1,
          images: 1,

          category: {
            _id: "$categories._id",
            name: "$categories.name",
            slug: "$categories.slug",
          },

          subCategory: {
            _id: "$subCategories._id",
            name: "$subCategories.name",
            slug: "$subCategories.slug",
          },
        },
      },

      // {
      //   $facet: {
      //     data: [{ $skip: skip }, { $limit: limit }],
      //     count: [
      //       {
      //         $group: {
      //           _id: null,
      //           total: { $sum: 1 },
      //         },
      //       },
      //     ],
      //   },
      // },

      // {
      //   $project: {
      //     data: 1,
      //     count: { $arrayElemAt: ["$count.total", 0] },
      //   },
      // },
    ];

    //   ...basePipeline,
    //   {
    //     $facet: {
    //       data: [{ $skip: skip }, { $limit: limit }],
    //       total: [{ $count: "count" }],
    //     },
    //   },
    // ]);

    // const totalGroups = await Product.countDocuments();

    const result = await Product.aggregate([
      ...basePipeline,
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          result: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          totalCount: 1,
          list: { $slice: ["$result", skip, limit] },
        },
      },
    ]);

    console.log("result-----", result)
    // const data = result[0] || { totalCount: 0, list: [] };


    return res.status(200).json({
      status: true,
      message: "Products fetched successfully.",
      page,
      limit,
      count: result[0].totalCount || 0,
      data : result[0].list || [],
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// -------------------- GET PRODUCT BY ID --------------------
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await Product.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },

      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categories",
        },
      },

      { $unwind: "$categories" },

      {
        $lookup: {
          from: "subcategories",
          localField: "subCategory",
          foreignField: "_id",
          as: "subCategories",
        },
      },
      { $unwind: "$subCategories" },

      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          slug: 1,
          price: 1,
          images: 1,

          category: {
            _id: "$categories._id",
            name: "$categories.name",
            slug: "$categories.slug",
          },

          subCategory: {
            _id: "$subCategories._id",
            name: "$subCategories.name",
            slug: "$subCategories.slug",
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
      message: error.message || MESSAGES.PRODUCTS.CREATE_FAIL,
    });
  }
};

// -------------------- UPDATE PRODUCT --------------------
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);

    const user = req.user;
    const data = req.body;

    console.log("----------------->>>", data);

    if (!product) {
      throw new errorHandle(
        HttpStatus.BAD_REQUEST,
        MESSAGES.PRODUCTS.NOT_FOUND
      );
    }

    if (
      user.role !== ROLE_STATUS.ROLE.ADMIN &&
      product.owner.toString() !== user._id.toString()
    ) {
      throw new errorHandle(
        HttpStatus.FORBIDDEN,
        MESSAGES.PRODUCTS.UNAUTHORIZED_ACCESS
      );
    }

    if (user.role !== ROLE_STATUS.ROLE.ADMIN && data.status) {
      delete data.status;
    }

    Object.assign(product, data);
    await product.save();

    return res.status(200).json({
      status: true,
      message: MESSAGES.PRODUCTS.UPDATE_SUCCESS,
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || MESSAGES.PRODUCTS.CREATE_FAIL,
    });
  }
};

// -------------------- DELETE PRODUCT (SOFT DELETE) --------------------
export const deleteProduct = async (req, res) => {
  try {
    const user = req.user;

    const product = await Product.findById(req.params.productId);

    if (!product) {
      throw new errorHandle(
        HttpStatus.BAD_REQUEST,
        MESSAGES.PRODUCTS.NOT_FOUND
      );
    }

    if (
      user.role !== ROLE_STATUS.ROLE.ADMIN &&
      product.owner.toString() !== user._id.toString()
    ) {
      throw new errorHandle(HttpStatus.FORBIDDEN, MESSAGES.AUTH.UNAUTHORIZED);
    }

    product.isdeleted = true;
    await product.save();

    return res.status(200).json({
      status: true,
      message: MESSAGES.PRODUCTS.DELETE_SUCCESS,
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || MESSAGES.PRODUCTS.CREATE_FAIL,
    });
  }
};

// -----------------------UPLOAD PRODUCT IMAGE-----------------------

export const uploadImage = async (req, res) => {
  if (!req.uploadedImages || req.uploadedImages.length === 0) {
    return res.send(
      new ApiResponse(
        HttpStatus.BAD_REQUEST,
        null,
        MESSAGES.PRODUCTS.NO_IMAGE_UPLOADED
      )
    );
  }

  const filesData = req.uploadedImages.map((file) => ({
    url: file.url,
    public_id: file.public_id,
  }));

  res.send(
    new ApiResponse(
      HttpStatus.OK,
      filesData,
      MESSAGES.PRODUCTS.IMAGE_UPLOAD_SUCCESS
    )
  );
};

// -------------------- GET PRODUCT LIST (LOOKUPS) --------------------
export const getProductsList = async (req, res) => {
  try {
    const products = await Product.aggregate([
      { $match: { slug: query } },

      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categories",
        },
      },
      { $unwind: "$categories" },

      {
        $lookup: {
          from: "subcategories",
          localField: "subCategory",
          foreignField: "_id",
          as: "subCategories",
        },
      },
      { $unwind: "$subCategories" },

      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          slug: 1,
          price: 1,
          images: 1,

          category: {
            _id: "$categories._id",
            name: "$categories.name",
            slug: "$categories.slug",
          },

          subCategory: {
            _id: "$subCategories._id",
            name: "$subCategories.name",
            slug: "$subCategories.slug",
          },
        },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: MESSAGES.PRODUCTS.ALL_FETCHED,
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || MESSAGES.PRODUCTS.CREATE_FAIL,
    });
  }
};

// -------------------- PUBLIC PRODUCTS --------------------
export const publicProducts = async (req, res) => {
  try {
    const user = req.user;

    const products = await Product.aggregate([
      {
        $match: {
          $expr: {
            $and: [
              { $ne: ["$owner", user._id] },
              { $eq: ["$status", "accepted"] },
            ],
          },
        },
      },
    ]);

    if (!products.length) {
      throw new errorHandle(
        HttpStatus.BAD_REQUEST,
        MESSAGES.PRODUCTS.NOT_FOUND
      );
    }

    return res.status(200).json({
      status: true,
      message: MESSAGES.PRODUCTS.ALL_FETCHED,
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || MESSAGES.PRODUCTS.CREATE_FAIL,
    });
  }
};

// -------------------- ADMIN DASHBOARD --------------------
export const adminDashboard = async (req, res) => {
  try {
    const { title } = req.params;

    const result = await Product.find({ name: title });

    return res.status(200).json({
      status: true,
      message: MESSAGES.PRODUCTS.ALL_FETCHED,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || MESSAGES.PRODUCTS.CREATE_FAIL,
    });
  }
};

// -------------------- SELF PRODUCT BY ID --------------------
export const selfProductById = async (req, res) => {
  try {
    const { title } = req.params;
    const { status } = req.query;
    const user = req.user;

    const products = await Product.find({
      owner: title,
      status: status || "pending",
    });

    if (user.role === ROLE_STATUS.ROLE.ADMIN) {
      const all = await Product.find({ status: status || "pending" });
      return res.status(200).json({
        status: true,
        message: MESSAGES.PRODUCTS.FETCH_ALL_SUCCESS,
        data: all,
      });
    }

    // const all = await Product.find({ status: status || "pending" });
    //   return res.status(200).json({
    //     status: true,
    //     message: MESSAGES.PRODUCTS.FETCH_ALL_SUCCESS,
    //     data: all,
    //   });

    return res.status(200).json({
      status: true,
      message: MESSAGES.PRODUCTS.FETCH_SUCCESS,
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message || MESSAGES.PRODUCTS.CREATE_FAIL,
    });
  }
};

// -------------------- PRODUCT SEARCH --------------------
export const productByQuery = async (req, res) => {
  try {
    const { query } = req.params;

    const result = await Product.aggregate([
      { $match: { slug: query } },

      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categories",
        },
      },
      { $unwind: "$categories" },

      {
        $lookup: {
          from: "subcategories",
          localField: "subCategory",
          foreignField: "_id",
          as: "subCategories",
        },
      },
      { $unwind: "$subCategories" },

      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          slug: 1,
          price: 1,
          images: 1,

          category: {
            _id: "$categories._id",
            name: "$categories.name",
            slug: "$categories.slug",
          },

          subCategory: {
            _id: "$subCategories._id",
            name: "$subCategories.name",
            slug: "$subCategories.slug",
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
      message: error.message || MESSAGES.PRODUCTS.CREATE_FAIL,
    });
  }
};
