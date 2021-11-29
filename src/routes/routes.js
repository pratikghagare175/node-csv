import fs from "fs";
import express from "express";
import multer from "multer";
import csv from "csv";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "csv-uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

//? Filtering received files
const upload = multer({
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.csv$/)) {
      return cb(new Error("File should be an JSON file with json extension"));
    }
    cb(undefined, true);
  },
  storage,
});

// Create the parser with delimeter as comma ","
const parser = csv.parse({
  delimiter: ",",
  columns: true,
});

// const csvWriter = csv.stringify({ header: true });

router.post("/test-csv", upload.single("csv-file"), (req, res) => {
  const generateCSV = [];
  fs.createReadStream(`csv-uploads/${req.file.originalname}`)
    .pipe(parser)
    .on("data", (csvrow) => {
      const extractDate = csvrow.timestamp.slice(0, 10);
      const extractDateIndex = generateCSV.findIndex((val) => val.date === extractDate);

      if (extractDateIndex > -1) {
        generateCSV[extractDateIndex].totalOpen += parseInt(csvrow.open);
        generateCSV[extractDateIndex].totalClose += parseInt(csvrow.close);
        generateCSV[extractDateIndex].totalHigh += parseInt(csvrow.high);
        generateCSV[extractDateIndex].totalLow += parseInt(csvrow.low);
        generateCSV[extractDateIndex].totalVolume += parseInt(csvrow.volume);
      } else {
        const calcObj = {
          date: extractDate,
          totalOpen: parseInt(csvrow.open),
          totalClose: parseInt(csvrow.close),
          totalHigh: parseInt(csvrow.high),
          totalLow: parseInt(csvrow.low),
          totalVolume: parseInt(csvrow.volume),
        };
        generateCSV.push(calcObj);
      }
    })
    .on("end", () => {
      fs.unlinkSync(`csv-uploads/${req.file.originalname}`); //Remove File after operation

      csv.stringify(generateCSV, { header: true }, function (err, outputData) {
        fs.writeFile("csv-downloads/test.csv", outputData, () => {});
      });

      // const file = `csv-downloads/test.csv`;
      console.log("=== Ending CSV Operation ====");
      // res.download(file);
      // res.send("ok working");
    });

  res.send("ok working");
});

export default router;
