const Storage = require("../models/storage");

exports.createStoragrHandle = async function (storage) {
  const newStorage = new Storage({
    asset_id: storage.asset_id,
    dir: storage.dir,
    public_id: storage.public_id,
    width: storage.width,
    height: storage.height,
    format: storage.format,
    resource_type: storage.resource_type,
    bytes: storage.bytes,
    url: storage.url,
    folder: storage.folder,
    permission: "Public",
  });
  return await newStorage.save();
};

exports.getFileHandle = async function (folder, objectId) {
  let filter = {
    objectId: objectId,
    folder: folder,
  };
  try {
    return await Storage.findOne(filter);
  } catch (error) {
    return error;
  }
};
