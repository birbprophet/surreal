const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { tmpdir } = require("os");
const { Storage: storage } = require("@google-cloud/storage");
const { dirname, join } = require("path");
const sharp = require("sharp");
const fs = require("fs-extra");
const gcs = new storage();
admin.initializeApp();
const db = admin.firestore();

export const resizeImg = functions
  .runWith({ memory: "2GB", timeoutSeconds: 120 })
  .storage.object()
  .onFinalize(async object => {
    const bucket = gcs.bucket(object.bucket);
    const filePath = object.name;
    const fileName = filePath.split("/").pop();
    const bucketDir = dirname(filePath);

    const workingDir = join(tmpdir(), "resize");
    const tmpFilePath = join(workingDir, "source.png");

    console.log(`Got ${fileName} file`);

    if (fileName.includes("@s_") || !object.contentType.includes("image")) {
      console.log(`Already resized. Exiting function`);
      return false;
    }

    await fs.ensureDir(workingDir);
    await bucket.file(filePath).download({ destination: tmpFilePath });

    const uid = fileName.replace(`.${fileName.split(".").pop()}`, "");

    const sizes = [640, 200, 40];

    const uploadPromises = sizes.map(async size => {
      console.log(`Resizing ${fileName} at size ${size}`);

      const newImgName = `${uid}@s_${size}.jpg`;
      const imgPath = join(workingDir, newImgName);
      await sharp(tmpFilePath)
        .resize({
          width: size,
          height: size,
          fit: sharp.fit.cover,
          position: sharp.strategy.entropy
        })
        .toFormat("jpeg")
        .jpeg({
          quality: 100,
          chromaSubsampling: "4:4:4",
          force: true
        })
        .toFile(imgPath);

      console.log(`Just resized ${newImgName} at size ${size}`);

      return bucket.upload(imgPath, {
        destination: join(bucketDir, newImgName),
        predefinedAcl: "publicRead"
      });
    });

    await Promise.all(uploadPromises);

    const currentTime = new Date();
    const currentTimestamp = currentTime.getTime();
    const templateString = `https://firebasestorage.googleapis.com/v0/b/surreal-d0311.appspot.com/o/profilePictureUploads%2F__USER_UID__%40s___SIZE__.jpg?alt=media&t=${currentTimestamp.toString()}`;
    await db
      .collection("users")
      .doc(uid)
      .set(
        {
          profilePictureUrls: {
            thumbnail: templateString
              .replace("__USER_UID__", uid)
              .replace("__SIZE__", sizes[0].toString()),
            small: templateString
              .replace("__USER_UID__", uid)
              .replace("__SIZE__", sizes[1].toString()),
            medium: templateString
              .replace("__USER_UID__", uid)
              .replace("__SIZE__", sizes[2].toString())
          }
        },
        { merge: true }
      )
      .catch(error => {
        console.log("Error writing document: " + error);
        return false;
      });

    return fs.remove(workingDir);
  });
