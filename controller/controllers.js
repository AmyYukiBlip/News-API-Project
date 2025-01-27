const { fetchTopics, fetchArticle } = require("../model/models");
const endpoints = require("../endpoints.json");

function getEndpointsJson(req, res){
        res.status(200).send({endpoints});
};


function getTopics(req, res, next) {
  fetchTopics(req)
    .then((topics) => {
      res.status(200).send(topics);
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

module.exports = { getEndpointsJson, getTopics, getArticleById };
