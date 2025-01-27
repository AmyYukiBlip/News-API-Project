const express = require("express");
const app = express();
const { getTopics, getArticleById } = require("./controller/controllers");
const endpoints = require("./endpoints.json");

app.use(express.json());

// GET requests

app.get("/api", (req, res) => {
  res.status(200).send({ endpoints });
});

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleById);

// ** error handling middleware ** //

// non existent endpoint catchall
app.all("*", (err, req, res, next) => {
  if (err) {
    res.status(404).send({ msg: "Not Found" });
  } else {
    next(err); 
  }
});

app.use((err, req, res, next) => {
    if (err.status) {
      res.status(error.status).send({ msg: err.msg });
    } else {
      next(err); 
    }
  });

  app.use((err, req, res, next) => {
    if (err.code === "22P02") {
      res.status(400).send({ msg: "Bad Request" });
    } else {
      next(err); 
    }
  });

app.use((err, req, res, next) => {
  if (err) {
    res.status(404).send({ msg: "Not Found" });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err);
  res.status(500).send({ msg: "Internal Server Error" });
});

module.exports = app;
