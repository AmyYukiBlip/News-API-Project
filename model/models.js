const db = require("../db/connection");

function fetchTopics() {
  return db.query(`SELECT * FROM topics;`).then((res) => {
    return res.rows;
  });
}

function fetchAllArticles(queries) {
  const sort_by = queries.sort_by;
  const order = queries.order.toUpperCase();
  return db
    .query(
      `SELECT 
    article_id, title, topic, author, created_at, votes, article_img_url 
    FROM articles 
    ORDER BY ${sort_by} ${order}`
    )
    .then((res) => {
      return res.rows;
    });
}

function fetchArticle(article_id) {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1;`, [article_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject("Not Found");
      } else return rows[0];
    });
}

function fetchArticleComments(article_id) {
  return db
  .query(`SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC;`, [article_id])
  .then(({rows}) => {
    if (rows.length === 0) {
      return Promise.reject("Not Found")
    } else return rows
    })
}

module.exports = {
  fetchTopics,
  fetchAllArticles,
  fetchArticle,
  fetchArticleComments,
};
