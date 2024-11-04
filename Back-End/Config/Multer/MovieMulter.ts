import multer, { StorageEngine, FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";

const baseDir = process.cwd();

class MovieImageUploads {
  private static ensureDirectoryExists(directory: string): void {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
  }

  private static customStorage: StorageEngine = {
    _handleFile: (req, file, cb) => {
      let directory: string;

      console.log("file.fieldname: ", file);
      
  
      switch (file.fieldname) {
        case 'poster':
          directory = "MoviePosters";
          break;
        case 'movieImages':
          directory = "MovieImages";
          break;
        case 'castImages':
          directory = "CastsImages";
          break;
        default:
          return cb(new Error("Invalid field name"));
      }
  
      const uploadPath = path.join(baseDir, "Back-End/public", directory);
      this.ensureDirectoryExists(uploadPath);
      const filename = `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`;
      const fullPath = path.join(uploadPath, filename);
  
      console.log(`Uploading file: ${fullPath}`);
  
      const stream = fs.createWriteStream(fullPath);
      file.stream.pipe(stream);
  
      stream.on('finish', () => {
        console.log(`File uploaded successfully: ${fullPath}`);
        cb(null, { filename });
      });
  
      stream.on('error', (error) => {
        console.error(`Error uploading file: ${error.message}`);
        cb(error);
      });
    },

    _removeFile: (req, file, cb) => {
      const directory = 
        file.fieldname === 'poster' ? "MoviePosters" :
        file.fieldname === 'movieImages' ? "MovieImages" :
        "CastsImages";

      const filePath = path.join(baseDir, "Back-End/public", directory, file.filename);
      fs.unlink(filePath, (err) => cb(err));
    }
  };

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
      cb(new Error("Only images are allowed!"));
    }
  }

  public static multerUploadMultipleFields = multer({
    storage: this.customStorage,
    fileFilter: this.fileFilter,
    limits: {
      fileSize: 1024 * 1024 * 5,
    }
  }).fields([
    { name: 'poster', maxCount: 1 },
    { name: 'movieImages', maxCount: 10 },
    { name: 'castImages', maxCount: 5 }
  ]);
  
}

export default MovieImageUploads;
