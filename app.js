const express = require("express");
const app = express();
const { getTopics } = require("./controller/controllers");
const endpoints = require("./endpoints.json");

app.use(express.json());

// GET requests 

app.get("/api", (req, res) => {
  res.status(200).send( { endpoints } );
});

app.get("/api/topics", getTopics)


// error handling middleware

app.use((err, req, res, next) => {
  if (err) {
    res.status(400).send({ error: "Bad Request" });
  } else {
    next(err); // pass it on to the next handler
  }
});

app.use((err, req, res, next) => {
    if (err) {
      res.status(404).send({ error: "Not Found" });
    } else {
      next(err); // pass it on to the next handler
    }
  });

app.use((err, req, res, next) => {
  if (err);
  res.status(500).send({ error: "Internal Server Error" });
});

module.exports = app;
