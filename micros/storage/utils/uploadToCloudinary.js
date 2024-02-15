const cloudinary = require("cloudinary").v2;
const utils = require("../../../core/utils/error-handler");
const { HttpStatusCode } = require("../../../core/utils/HttpStatusCode");
const log = require("../../../core/utils/errorLogger");
const { appConfig } = require("../config");
const multer = require("multer");
cloudinary.config({
  cloud_name: appConfig.CLOUDINARY_CLOUD_NAME,
  api_key: appConfig.CLOUDINARY_API_KEY,
  api_secret: appConfig.CLOUDINARY_API_SECRET,
  secure: true,
});

const memoryStorage = multer.memoryStorage();
const upload = multer({
  storage: memoryStorage,
});

const uploadToCloudinary = async (folder, fileString, format) => {
  try {
    const { uploader } = cloudinary;
    const res = await uploader.upload(
      `data:image/${format};base64,${fileString}`,
      { folder: `${folder}`, resource_type: "auto" }
    );

    return res;
  } catch (error) {
    log.Error("Credential parse " + error);
    throw new utils.ErrorHandler(
      HttpStatusCode.InternalServerError,
      "storage.internal/upload, Credential parse error!"
    );
  }
};

module.exports = {
  upload,
  uploadToCloudinary,
};
