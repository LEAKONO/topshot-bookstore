const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Verify environment variables first
const requiredEnvVars = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars);
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

// Configure Cloudinary with error logging
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true // Force HTTPS
});

// Test Cloudinary connection
const testCloudinaryConnection = async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful:', result);
  } catch (error) {
    console.error('❌ Cloudinary connection failed:', error.message);
    throw error;
  }
};

// Enhanced storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    console.log(`📁 Uploading file: ${file.originalname}`);
    console.log(`📋 File mimetype: ${file.mimetype}`);
    console.log(`📏 File size: ${file.size} bytes`);
    
    return {
      folder: 'book-covers',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ 
        width: 800, 
        crop: 'limit', 
        quality: 'auto',
        fetch_format: 'auto'
      }],
      public_id: `book-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      resource_type: 'auto'
    };
  }
});

// Enhanced file filter with better error messages
const fileFilter = (req, file, cb) => {
  console.log(`🔍 Filtering file: ${file.originalname}, mimetype: ${file.mimetype}`);
  
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (!allowedTypes.includes(file.mimetype)) {
    console.log('❌ Rejected file type:', file.mimetype);
    const error = new Error(`Only image files are allowed! Supported formats: ${allowedTypes.join(', ')}`);
    error.code = 'INVALID_FILE_TYPE';
    return cb(error, false);
  }
  
  console.log('✅ File type accepted:', file.mimetype);
  cb(null, true);
};

// Enhanced upload middleware with better error handling
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Enhanced error handling middleware
const handleUploadError = (err, req, res, next) => {
  console.error('📤 Upload error:', err);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size allowed is 10MB.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field. Please use "coverImage" field name.'
      });
    }
  }
  
  if (err.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  return res.status(500).json({
    success: false,
    message: 'File upload failed. Please try again.'
  });
};

// Debug function with more detailed info
const verifyConfig = () => {
  console.log('🔧 Cloudinary Configuration Check:');
  console.log('- Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ MISSING');
  console.log('- API Key:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ MISSING');
  console.log('- API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ MISSING');
  console.log('- Environment:', process.env.NODE_ENV || 'development');
};

// Initialize connection test
const initializeCloudinary = async () => {
  verifyConfig();
  await testCloudinaryConnection();
};

// Call initialization
initializeCloudinary().catch(console.error);

module.exports = {
  cloudinary,
  upload,
  handleUploadError,
  verifyConfig,
  testCloudinaryConnection
};