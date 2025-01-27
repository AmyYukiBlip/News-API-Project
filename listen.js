const app = require("./app");
const port = process.env.PORT || 9090


app.listen(port, () => {
    console.log("Server is listening on port 9090...");
  });