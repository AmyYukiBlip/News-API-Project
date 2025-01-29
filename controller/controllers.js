const {
  fetchTopics,
  fetchAllArticles,
  fetchArticle,
  fetchArticleComments,
  addComment,
} = require("../model/models");
const endpoints = require("../endpoints.json");
const { response } = require("../app");

function getEndpointsJson(req, res) {
  res.status(200).send({ endpoints });
}

function getTopics(req, res, next) {
  fetchTopics(req)
    .then((topics) => {
      res.status(200).send(topics);
    })
    .catch((err) => {
      next(err);
    });
}

function getArticles(req, res, next) {
  const queries = req.query;
  fetchAllArticles(queries)
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch((err) => {
      next(err);
    });
}

function getArticleById(req, res, next) {
  const { article_id } = req.params;
  fetchArticle(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
}

function getArticleComments(req, res, next) {
  const { article_id } = req.params;
  fetchArticleComments(article_id)
    .then((article) => {
      res.status(200).send(article);
    })
    .catch((err) => {
      next(err);
    });
}

function postComment(req, res, next) {
  const newComment = req.body;
  const { article_id } = req.params;
  addComment(newComment, article_id)
    .then((comment) => {
      res.status(201).send({ posted_comment: comment });
    })
    .catch((err) => {
      next(err);
    });
}

module.exports = {
  getEndpointsJson,
  getTopics,
  getArticles,
  getArticleById,
  getArticleComments,
  postComment,
};
