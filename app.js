import express from "express";
import csvRoute from "./src/routes/routes.js";

const port = process.env.PORT || 3010;
const app = express();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.listen(port, () => {
  console.log(`Server Running on port ${port}`);
});

app.use(csvRoute);
