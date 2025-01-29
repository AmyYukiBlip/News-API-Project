const express = require("express");
const app = express();
const {
  getEndpointsJson,
  getTopics,
  getArticles,
  getArticleById,
  getArticleComments,
  postComment
} = require("./controller/controllers");

app.use(express.json());

// GET requests

app.get("/api", getEndpointsJson);

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles/:article_id/comments", getArticleComments);

// POST requests

app.post("/api/articles/:article_id/comments", postComment);

// ** error handling middleware ** //

// non existent endpoint catchall
app.all("*", (req, res, next) => { 
    res.status(404).send({ error: "Path Not Found" });
});

// forced error message catchall
app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send(err.error );
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err.code === "22P02" || err.code === "42703") {
    res.status(400).send({ error: "Bad Request" });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err) {
    res.status(404).send({ error: "Not Found" });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err);
  console.log(err, "<< Error not handled yet");
  res.status(500).send({ error: "Internal Server Error" });
});

module.exports = app;
