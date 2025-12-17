import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import SubCategory from "../models/subCategoryModel.js";

import { getDailyStats } from "../utils/dailyStats.js";
import { getWeeklyStats } from "../utils/weeklyStats.js";
import { getMonthlyStats } from "../utils/monthlyStats.js";
import { getYearlyStats } from "../utils/yearlyStats.js";
import userModel from "../models/userModel.js";



// -------------------------- get USERS DATA -----------------------
export async function getUserData(req, res) {
  try {
    const { type } = req.query; 
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;


    if(type){
    let data;

    switch (type) {
      case "daily":
        data = await getDailyStats(User, page, limit);
        break;

      case "weekly":
        data = await getWeeklyStats(User, page, limit);
        break;

      case "monthly":
        data = await getMonthlyStats(User, page , limit);
        break;

      case "yearly":
        data = await getYearlyStats(User, page , limit);
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Invalid type. Use: daily, weekly, monthly, yearly",
        });
    }

    return res.status(200).json({
      success: true,
      message: `${type} user data fetched successfully`,
      data,
    });
  } 
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}


// -------------------------- get CATEGORY DATA -----------------------
export async function getCategory(req, res) {
  try{
    const { type } = req.query;
    const page = req.query.page;
    const limit = req.query.limit; 

    if(type){
    let data;

    switch (type) {
      case "daily":
        data = await getDailyStats(Category, page, limit);
        break;

      case "weekly":
        data = await getWeeklyStats(Category, page, limit);
        break;

      case "monthly":
        data = await getMonthlyStats(Category, page, limit);
        break;

      case "yearly":
        data = await getYearlyStats(Category, page, limit);
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Invalid type. Use: daily, weekly, monthly, yearly",
        });
    }

    return res.status(200).json({
      success: true,
      message: `${type} user data fetched successfully`,
      data: data,
    });
  }

  }catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}


// -------------------------- get SUB-CATEGORY DATA -----------------------
export async function getSubcategory(req, res) {
  try{
    const { type } = req.query; 
    const page = req.query.page;
    const limit = req.query.limit;

    if(type){
    let data;

    switch (type) {
      case "daily":
        data = await getDailyStats(SubCategory, page, limit);
        break;

      case "weekly":
        data = await getWeeklyStats(SubCategory, page, limit);
        break;

      case "monthly":
        data = await getMonthlyStats(SubCategory, page, limit);
        break;

      case "yearly":
        data = await getYearlyStats(SubCategory, page, limit);
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Invalid type. Use: daily, weekly, monthly, yearly",
        });
    }

    return res.status(200).json({
      success: true,
      message: `${type} user data fetched successfully`,
      data: data,
    });
  }
  }catch(error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}


// -------------------------- get PRODUCT DATA -----------------------
export async function getProducts(req, res) {
  try{
    const { type } = req.query; 
    const page = req.query.page;
    const limit = req.query.limit;

    if(type){
    let data;

    switch (type) {
      case "daily":
        data = await getDailyStats(Product, page, limit);
        break;

      case "weekly":
        data = await getWeeklyStats(Product, page, limit);
        break;

      case "monthly":
        data = await getMonthlyStats(Product, page, limit);
        break;

      case "yearly":
        data = await getYearlyStats(Product, page, limit);
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Invalid type. Use: daily, weekly, monthly, yearly",
        });
    }

    return res.status(200).json({
      success: true,
      message: `${type} user data fetched successfully`,
      data: data,
    });
  }
  }catch(error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ----------------------------- get full Dashboard Data ------------------------------
export const getDashboard = async (req, res) => {
  try {
    const users = {
      daily: await getDailyStats(User),
      weekly: await getWeeklyStats(User),
      monthly: await getMonthlyStats(User),
      yearly: await getYearlyStats(User)
    };

    const products = {
      daily: await getDailyStats(Product),
      weekly: await getWeeklyStats(Product),
      monthly: await getMonthlyStats(Product),
      yearly: await getYearlyStats(Product)
    };

    const categories = {
      daily: await getDailyStats(Category),
      weekly: await getWeeklyStats(Category),
      monthly: await getMonthlyStats(Category),
      yearly: await getYearlyStats(Category)
    };

    const subCategories = {
      daily: await getDailyStats(SubCategory),
      weekly: await getWeeklyStats(SubCategory),
      monthly: await getMonthlyStats(SubCategory),
      yearly: await getYearlyStats(SubCategory)
    };

    return res.status(200).json({
      success: true,
      message: "Dashboard data fetched.",
      data: { users, products, categories, subCategories }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ------------------------------------ get total count -------------------------------------
export async function getTotal(req, res) {
  try{
    const totalUser = await userModel.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalSubCategories = await SubCategory.countDocuments();
    const totalProducts = await Product.countDocuments();

    return res.status(200).json({
      success: true,
      message: "Successfully get total count's",
      data: {
        users: totalUser,
        categories: totalCategories,
        SubCategories: totalSubCategories,
        Products: totalProducts,
      }
    })
  }catch(error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
  
}