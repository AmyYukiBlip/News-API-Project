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
    articles.article_id, 
    articles.title, 
    articles.topic, 
    articles.author, 
    articles.created_at, 
    articles.votes, 
    articles.article_img_url, 
    COUNT(comments.article_id)::INT AS comment_count
    FROM articles
    LEFT JOIN comments ON comments.article_id = articles.article_id
    GROUP BY articles.article_id
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
    .query(
      `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC;`,
      [article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject("Not Found");
      } else return rows;
    });
}

module.exports = {
  fetchTopics,
  fetchAllArticles,
  fetchArticle,
  fetchArticleComments,
};
