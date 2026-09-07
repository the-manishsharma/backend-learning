import multer from "multer";

// configuration of multer
// we are using diskstorage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // file access is owned by multer
    cb(null, './public/temp')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

export const upload = multer({
     storage,
})

//here we have solved localpath story