const MESSAGES = {
  USERS: {
    EMPTY: "No users found",
    INVALID: "Invalid user data",
    CREATED: "User created successfully",
    UPDATED: "User updated successfully",
    DELETED: "User deleted successfully",
    ALREADY_EXISTS: "User already exists",
    USERVERIFIED: "User already verified"
  },

  AUTH: {
    LOGIN_SUCCESS: "Login successful",
    LOGIN_FAILED: "Invalid email or password",
    LOGOUT_SUCCESS: "Logout successful",
    TOKEN_EXPIRED: "Token has expired",
    TOKEN_INVALID: "Invalid token",
    UNAUTHORIZED: "You are not authorized",
    TOKEN_REVOKED: "Token has been revoked. Please log in again.",
    REGISTER_SUCCESS: "Registration successful",
    REGISTER_FAILED: "Registration failed",
    EMAIL_ALREADY_USED: "Email is already in use",
    PASSWORD_MISMATCH: "Passwords do not match",
    INVALID_CREDENTIALS: "Invalid credentials provided",
    ACCOUNT_LOCKED: "Your account is locked, contact support",
    PASSWORD_RESET_SUCCESS: "Password reset successfully",
    PASSWORD_RESET_FAILED: "Password reset failed",
    PASSWORD_CHANGED: "Password changed successfully",
    OTP_SENT: "OTP has been sent successfully",
    OTP_SENT_FAILED: "Failed to send OTP, please try again",
    OTP_VERIFIED: "OTP verified successfully",
    OTP_VERIFICATION_FAILED: "OTP verification failed",
    OTP_EXPIRED: "OTP has expired, please request a new one",
    OTP_INVALID: "Invalid OTP, please try again",
    OTP_RESENT: "OTP has been resent successfully",
    EXIST_BUT_NOT_VERIFIED: "User already registered but not verified. Please verify your account."
  },

  ONBOARDING: {
    PROFILE_CREATED: "User profile created successfully",
    PROFILE_UPDATED: "User profile updated successfully",
    PROFILE_INVALID: "Invalid profile data",
    DOCUMENTS_UPLOADED: "Documents uploaded successfully",
    DOCUMENTS_REQUIRED: "Required documents are missing",
    VERIFICATION_SUCCESS: "User verified successfully",
    VERIFICATION_FAILED: "User verification failed",
    EMAIL_VERIFICATION_SENT: "Email verification sent",
    EMAIL_VERIFICATION_FAILED: "Email verification failed",
    NOT_VERIFIED: "Please verify your email or phone first"
  },

  GENERAL: {
    SERVER_ERROR: "Something went wrong, please try again later",
    VALIDATION_ERROR: "Data validation failed",
    RESOURCE_NOT_FOUND: "Requested resource not found",
    ACTION_NOT_ALLOWED: "This action is not allowed",
    DATA_FETCHED: "Data fetched successfully"
  },

  CATEGORY: {
    CREATE_SUCCESS: 'Category created successfully.',
    CREATE_FAILED: 'Failed to create category.',
    FETCH_SUCCESS: 'Categories retrieved successfully.',
    FETCH_FAILED: 'Failed to retrieve categories.',
    NOT_FOUND: 'Category not found.',
    UPDATE_SUCCESS: 'Category updated successfully.',
    UPDATE_FAILED: 'Failed to update category.',
    DELETE_SUCCESS: 'Category deleted successfully.',
    DELETE_FAILED: 'Failed to delete category.',
    STATUS_UPDATED: 'Category status updated successfully.',
    INVALID_STATUS: 'Invalid status value provided.',
  },

  SUBCATEGORY: {
    ADD_SUCCESS: 'Subcategory added successfully.',
    ADD_FAILED: 'Failed to add subcategory.',
    UPDATE_SUCCESS: 'Subcategory updated successfully.',
    NOT_FOUND: 'Subcategory not found.',
    DELETE_SUCCESS: 'Subcategory deleted successfully.',
    DELETE_FAILED: 'Failed to delete subcategory.',
    DUPLICATE_SLUG: 'Subcategory slug must be unique.',
  },

  PRODUCTS: {
    CREATE_SUCCESS: "Product created successfully!",
    CREATE_FAIL: "Failed to create product.",
    UPDATE_SUCCESS: "Product updated successfully!",
    UPDATE_FAIL: "Failed to update product.",
    DELETE_SUCCESS: "Product deleted successfully!",
    DELETE_FAIL: "Failed to delete product.",
    FETCH_SUCCESS: "Product fetched successfully!",
    FETCH_ALL_SUCCESS: "Products fetched successfully!",
    NOT_FOUND: "Product not found.",
    VALIDATION_ERROR: "Invalid input data.",
    SERVER_ERROR: "Internal server error. Please try again later."
  }
};

export default MESSAGES;
