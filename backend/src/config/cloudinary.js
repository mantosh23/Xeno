const cloudinary = require('cloudinary').v2;

// Configure Cloudinary using environment variables.
// The user should set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in the .env file.
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
  console.log('✅ Cloudinary configured successfully using individual keys.');
} else if (process.env.CLOUDINARY_URL) {
  console.log('✅ Cloudinary configured successfully using CLOUDINARY_URL.');
} else {
  console.warn('⚠️ Cloudinary configuration missing. Please add Cloudinary keys to .env');
}

/**
 * Uploads a base64 image string to Cloudinary and returns the secure URL.
 * @param {string} base64String - The base64 encoded image string.
 * @returns {Promise<string>} The secure URL of the uploaded image.
 */
const uploadBase64ToCloudinary = async (base64String) => {
  if (!base64String) return null;
  
  // Imagen typically returns JPEG or PNG bytes. We format it properly for Cloudinary.
  const dataUri = `data:image/jpeg;base64,${base64String}`;
  
  try {
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'stylehive_campaigns',
      use_filename: true,
      unique_filename: true,
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    // Fallback: If Cloudinary fails (e.g. invalid keys), just return the base64 so it doesn't break the app
    return dataUri;
  }
};

module.exports = {
  cloudinary,
  uploadBase64ToCloudinary,
};
