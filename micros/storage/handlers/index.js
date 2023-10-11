const utils = require("../../../core/utils/error-handler");
const { HttpStatusCode } = require("../../../core/utils/HttpStatusCode");
const log = require("../../../core/utils/errorLogger");
// const hmac = require("../utils/hmac");
const { appConfig } = require("../config");
// const { validate: uuidValidate } = require("uuid");
const { default: axios } = require("axios");
const path = require("path");

const { v4: uuidv4 } = require("uuid");
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

    // FormFile returns the first file for the given key `file`
    // it also returns the FileHeader so we can get the Filename,
    // the Header and the size of the file

    try {
      const file = req.formFile.file;

      log.Error("Uploaded File: " + file.filename);
      log.Error("File Size: " + file.size);
      log.Error("MIME Header: " + file.header);

      const extension = path.extname(file.filename);
      const fileNameUUID = uuid.Must(uuidv4());

      const fileName = fileNameUUID.String();
      const fileNameWithExtension = fileName + extension;
      const objectName = `${currentUserId}/${dirName}/${fileNameWithExtension}`;

      const config = {
        StorageBucket: appConfig.BUCKET_NAME,
      };

      try {
        const opt = appConfig.STORAGE_SECRET;
        const app = firebase.NewApp(ctx, config, opt);
        try {
          const client = app.Storage(ctx);
          try {
            const bucket = client.DefaultBucket();
            const wc = bucket.Object(objectName).NewWriter(ctx);

            try {
              const multiFile = file.Open();

              try {
                io.Copy(wc, multiFile);

                try {
                  wc.Close();
                  multiFile.Close();

                  const downloadURL = `${
                    appConfig.GATEWAY + appConfig.BASEROUTE
                  }/${currentUserId}/${dirName}/${fileNameWithExtension}`;

                  return res
                    .status(HttpStatusCode.OK)
                    .send({ payload: downloadURL });
                } catch (error) {
                  log.Error("Close storage and file writer error " + error);
                  return res
                    .status(HttpStatusCode.InternalServerError)
                    .send(
                      new utils.ErrorHandler(
                        "storage.internal/upload",
                        "Close storage and file writer error !"
                      ).json()
                    );
                }
              } catch (error) {
                log.Error("Copy file to storage error " + error);
                return res
                  .status(HttpStatusCode.InternalServerError)
                  .send(
                    new utils.ErrorHandler(
                      "storage.internal/upload",
                      "Copy file to storage error !"
                    ).json()
                  );
              }
            } catch (error) {
              log.Error("Open file error " + error);
              return res
                .status(HttpStatusCode.InternalServerError)
                .send(
                  new utils.ErrorHandler(
                    "storage.internal/upload",
                    "Open file error !"
                  ).json()
                );
            }
          } catch (error) {
            log.Error("Get default bucket " + error);
            return res
              .status(HttpStatusCode.InternalServerError)
              .send(
                new utils.ErrorHandler(
                  "storage.internal/upload",
                  "Get default bucket error!"
                ).json()
              );
          }
        } catch (error) {
          log.Error("Get storage client " + error);
          return res
            .status(HttpStatusCode.InternalServerError)
            .send(
              new utils.ErrorHandler(
                "storage.internal/upload",
                "Get storage client error!"
              ).json()
            );
        }
      } catch (error) {
        log.Error("Credential parse " + error);
        return res
          .status(HttpStatusCode.InternalServerError)
          .send(
            new utils.ErrorHandler(
              "storage.internal/upload",
              "Credential parse error!"
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

  const storageConfig = appConfig.storageConfig

  // Initialize Redis Connection
  var redisClient = "redisConfig";
  if (redisClient) {
    try {
      const redisPassword = appConfig.REDIS_PWD;

      log.Error(appConfig.REDIS_ADDRESS);
      log.Error(redisPassword);
      redisClient = redis.NewClient({
        Addr: appConfig.REDIS_ADDRESS,
        Password: redisPassword,
        DB: 0,
      });
      const pong = redisClient.Ping().Result();
      log.Error(pong);
    } catch (error) {
      log.Error(`\n\ncouldn't get payload-secret: ${error}\n\n`);
    }
  }

  log.Info("File Upload Endpoint Hit");

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

  log.Info("Directory name: " + dirName);

  const fileName = req.params.name;
  if (fileName == "") {
    log.Error("File name is required!");

    return res
      .status(HttpStatusCode.BadRequest)
      .send(
        new utils.ErrorHandler(
          "storage.fileNameRequired",
          "File name is required!"
        ).json()
      );
  }

  log.Info("File name: " + fileName);

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

  log.Info("\n User ID: " + userId);

  try {
    const userUUID = uuid.FromString(userId);

    const objectName = `${userUUID}/${dirName}/${fileName}`;

    // Generate download URL
    const downloadURL = generateV4GetObjectSignedURL(
      appConfig.BUCKET_NAME,
      objectName,
      appConfig.STORAGE_SECRET
    );

    const cacheSince = time.Now().Format(http.TimeFormat);
    const cacheUntil = time
      .Now()
      .Add(time.Second * time.Duration(cacheTimeout))
      .Format(http.TimeFormat);

    c.Set("Cache-Control", `max-age:${cacheTimeout}, public`);
    c.Set("Last-Modified", cacheSince);
    c.Set("Expires", cacheUntil);
    return c.Redirect(downloadURL, http.StatusTemporaryRedirect);
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

const cacheTimeout = 7200;

async function generateV4GetObjectSignedURL(
  bucketName,
  objectName,
  serviceAccount
) {
  // [START storage_generate_signed_url_v4]

  try {
    const conf = google.JWTConfigFromJSON(serviceAccount);
    const opts = {
      Scheme: storage.SigningSchemeV4,
      Method: "get",
      GoogleAccessID: conf.Email,
      PrivateKey: conf.PrivateKey,
      Expires: time.Now().Add(cacheTimeout * time.Second),
    };

    try {
      const u = storage.SignedURL(bucketName, objectName, opts);
      log.Error("Generated GET signed URL:");
      log.Error(`${u}\n`);
      // [END storage_generate_signed_url_v4]
      return u;
    } catch (error) {
      return "", log.Error("Unable to generate a signed URL: " + error);
    }
  } catch (error) {
    return "", log.Error("google.JWTConfigFromJSON: " + error);
  }
}
