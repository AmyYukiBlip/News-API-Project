const {
  fetchTopics,
  fetchAllArticles,
  fetchArticle,
  fetchArticleComments,
  addComment,
  updateVotes,
  deleteCommentByCommentID,
  fetchUsers,
} = require("../model/models");
const endpoints = require("../endpoints.json");

function getEndpointsJson(req, res) {
  res.status(200).send({ endpoints });
}

function getTopics(req, res, next) {
  fetchTopics(req)
    .then((topic) => {
      res.status(200).send({ topics: topic });
    })
    .catch((err) => {
      next(err);
    });
}

function getArticles(req, res, next) {
  const queries = req.query;
  fetchAllArticles(queries)
    .then((article) => {
      res.status(200).send({ articles: article });
    })
    .catch((err) => {
      next(err);
    });
}

function getArticleById(req, res, next) {
  const { article_id } = req.params;
  fetchArticle(article_id)
    .then((article) => {
      res.status(200).send({ articles: article });
    })
    .catch((err) => {
      next(err);
    });
}

function getArticleComments(req, res, next) {
  const { article_id } = req.params;
  fetchArticleComments(article_id)
    .then((comment) => {
      res.status(200).send({ comments: comment });
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

function patchVote(req, res, next) {
  const newVote = req.body.inc_votes;
  const { article_id } = req.params;
  updateVotes(newVote, article_id)
    .then((votedArticle) => {
      res.status(200).send({ articles: votedArticle });
    })  
    .catch((err) => {
      next(err);
    });
}

function deleteComment(req, res, next){
  const {comment_id} = req.params
  deleteCommentByCommentID(comment_id)
  .then((res) => {
    res.status(204).send(res)
  })
  .catch((err)=>{
    next(err);
  })
}

function getUsers(req, res, next) {
  fetchUsers()
    .then((user) => {
      res.status(200).send({users: user});
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
  patchVote,
  deleteComment,
  getUsers,
};
