const { fetchTopics} = require("../model/models");

function getTopics(req, res, next) {
  fetchTopics(req)
    .then((topics) => {
      res.status(200).send(topics);
    })
    .catch((err) => {
      next(err);
    });
}

module.exports = { getTopics };
