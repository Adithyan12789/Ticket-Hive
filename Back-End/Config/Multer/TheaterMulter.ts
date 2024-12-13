import multer, { StorageEngine, FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";

const baseDir = process.cwd();

class TheaterImageUploads {
  private static ensureDirectoryExists(directory: string): void {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
  }

  private static createStorage(directory: string): StorageEngine {
    const uploadPath = path.join(baseDir, "Back-End/public", directory);
    this.ensureDirectoryExists(uploadPath);
    console.log(`${directory} will be uploaded to: ${uploadPath}`);

    return multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        cb(
          null,
          `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
        );
      },
    });
  }

  private static theaterOwnerStorage(): StorageEngine {
    return this.createStorage("TheaterProfileImages");
  }

  private static theatersStorage(): StorageEngine {
    return this.createStorage("TheatersImages");
  }

  private static uploadCertificateStorage(): StorageEngine {
    return this.createStorage("UploadsCerificates");
  }  

  private static chatStorage(): StorageEngine {
    return this.createStorage("MessageFiles");
  }

  private static fileFilter(
    req: Express.Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ): void {
    console.log(`Received file: ${file.originalname}, type: ${file.mimetype}`);
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      console.error("File type not allowed");
      cb(new Error("Only images are allowed!") as any, false);
    }
  }

  public static multerUploadTheaterProfile = multer({
    storage: this.theaterOwnerStorage(),
    fileFilter: this.fileFilter,
  });

  public static multerUploadTheaterImages = multer({
    storage: this.theatersStorage(),
    fileFilter: this.fileFilter,
  });

  public static multerUploadCertificatesImages = multer({
    storage: this.uploadCertificateStorage(),
    fileFilter: this.fileFilter,
  });

  public static multerUploadChatImages = multer({
    storage: this.chatStorage(),
    fileFilter: this.fileFilter,
  });

}

export default TheaterImageUploads;
