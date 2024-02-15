const utils = require("../../../core/utils/error-handler");
const { HttpStatusCode } = require("../../../core/utils/HttpStatusCode");
const log = require("../../../core/utils/errorLogger");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { uploadToCloudinary } = require("../utils/uploadToCloudinary");
const { bufferToDataURI } = require("../utils/datauri");
const storage = require("../services/storage.services.js");

// UploadeHandle a function invocation
exports.uploadeHandle = async function (req, res) {
  try {
    const currentUserId = res.locals.user.uid;
    if (!currentUserId || currentUserId == null) {
      log.Error("[UploadeHandle] Can not get current user");
      return res
        .status(HttpStatusCode.Unauthorized)
        .send(
          new utils.ErrorHandler(
            "storage.invalidCurrentUser",
            "Can not get current user"
          ).json()
        );
    }

    log.Error("Hit upload endpoint by userId : " + currentUserId);

    // params from /storage/:uid/:dir
    const dirName = req.params.dir;
    if (!dirName) {
      log.Error("Directory name is required!");
      return res
        .status(HttpStatusCode.BadRequest)
        .send(
          new utils.ErrorHandler(
            "storage.directoryNameRequired",
            "Directory name is required!"
          ).json()
        );
    }

    log.Error("Directory name: " + dirName);

    try {
      const { file } = req;
      if (!file || file == null) {
        log.Error("[UploadeHandle] Can not get file");
        return res
          .status(HttpStatusCode.Unauthorized)
          .send(
            new utils.ErrorHandler(
              "storage.invalidfile",
              "Can not get file"
            ).json()
          );
      }

      log.Error("Uploaded File: " + file.originalname);
      log.Error("File Size: " + file.size);
      log.Error("MIME Header: " + file.mimetype);

      const extension = path.extname(file.originalname);
      const fileNameUUID = uuidv4();
      const fileNameWithExtension = fileNameUUID + extension;
      const folder = `${currentUserId}/${dirName}`;

      const objectName = `${fileNameWithExtension}`;
      log.Error("FileName With Extension: " + objectName);

      const fileFormat = file.mimetype.split("/")[1];
      const { base64 } = bufferToDataURI(fileFormat, file.buffer);
      const imageDetails = await uploadToCloudinary(folder, base64, fileFormat);

      try {
        const result = await storage.createStoragrHandle(imageDetails);
        return res
          .status(HttpStatusCode.OK)
          .send({ payload: result.url, other: result });
      } catch (error) {
        log.Error("Error information saving" + error);
        return res
          .status(HttpStatusCode.InternalServerError)
          .send(
            new utils.ErrorHandler(
              "storage.internal/save",
              "Error information saving!"
            ).json()
          );
      }
    } catch (error) {
      log.Error("Error Retrieving the File" + error);
      return res
        .status(HttpStatusCode.InternalServerError)
        .send(
          new utils.ErrorHandler(
            "storage.internal/upload",
            "Error Retrieving the File!"
          ).json()
        );
    }
  } catch (error) {
    log.Error("uploade Error " + error);
    return res
      .status(HttpStatusCode.InternalServerError)
      .send(
        new utils.ErrorHandler(
          "storage.uploadeHandle",
          "Save uploadeHandle Error!"
        ).json()
      );
  }
};

// GetFileHandle a function invocation
exports.getFileHandle = async function (req, res) {
  log.Error("File Upload Endpoint Hit");

  const dirName = req.params.dir;
  if (dirName == "") {
    log.Error("Directory name is required!");

    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler(
          "storage.dirNameRequired",
          "Directory name is required!"
        ).json()
      );
  }

  const objectId = req.params.name;
  if (objectId == "") {
    log.Error("name is required!");

    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler(
          "storage.fileNameRequired",
          "name is required!"
        ).json()
      );
  }

  log.Error("Object ID: " + objectId);

  const userId = req.params.uid;
  if (userId == "") {
    log.Error("User Id is required!");

    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler(
          "storage.fileNameRequired",
          "User id is required!"
        ).json()
      );
  }

  log.Error("\n User ID: " + userId);

  try {
    const result = await storage.getFileHandle(objectId);
    return res.status(HttpStatusCode.OK).send(result);
  } catch (error) {
    log.Error("UUID Error " + error);
    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler(
          "storage.uuidError",
          "can not parseUser id!"
        ).json()
      );
  }
};
