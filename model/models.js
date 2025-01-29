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

function addComment(newComment, article_id) {
  const { username, body } = newComment;
  if (body === "") {
    return Promise.reject({ status: 400, error: "Bad Request" });
  }
  return db
    .query(
      `
    INSERT INTO comments (body, author, article_id)
    VALUES ($1, $2, $3)
    RETURNING *;`,
      [body, username, article_id]
    )
    .then(({ rows }) => {
      return rows;
    });
}

function updateVotes(newVote, article_id) {
  // return the article from the DB to get current vote num
  return (
    db
      .query(
        `SELECT votes FROM articles
        WHERE article_id = $1;`,
        [article_id]
      )
      // calculate from incoming patch - increase or decrease current vote totalling new number
      .then(({ rows }) => {
        const currentVote = rows[0].votes;
        if (newVote === 0) {
          return Promise.reject({ status: 400, error: "Bad Request" });
        } else {
          const updatedVote = currentVote + newVote;
          // insert new num into db with UPDATE
          return db.query(
            `UPDATE articles 
          SET votes = $1
          WHERE article_id = $2
          RETURNING *;`,
            [updatedVote, article_id]
          );
        }
      })
      .then(({ rows }) => {
        return rows;
      })
  );
}

function deleteCommentByCommentID(comment_id) {
  // use sql DELETE to remove matching rows from a table
  // do not return content - it will return no.rows deleted though
  return db
    .query(
      `DELETE FROM comments
    WHERE comment_id = $1;`,
      [comment_id]
    )
    .then((res) => {
      if (res.rowCount === 1) {
        return Promise.reject({ status: 204, error: "No Content" });
      } 
    });
}

function fetchUsers() {
  return db.query(`
  SELECT * FROM users;
  `)
  .then(({rows})=>{
  return rows
  })
}

module.exports = {
  fetchTopics,
  fetchAllArticles,
  fetchArticle,
  fetchArticleComments,
  addComment,
  updateVotes,
  deleteCommentByCommentID,
  fetchUsers,
};
