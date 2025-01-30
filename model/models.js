const db = require("../db/connection");

function fetchTopics() {
  return db.query(`SELECT * FROM topics;`).then((res) => {
    return res.rows;
  });
}

function fetchAllArticles(queries) {
  const sort_by = queries.sort_by || "created_at";
  const order = queries.order || "desc";
  const topicFilter = queries.topic; 
  // { topic : 'cats' } so queries.topic / topicFilter = cats
  
  // staring with base query
  let SQLstring = `SELECT 
  articles.article_id, 
  articles.title, 
  articles.topic, 
  articles.author, 
  articles.created_at, 
  articles.votes, 
  articles.article_img_url, 
  COUNT(comments.article_id)::INT AS comment_count
  FROM articles
  LEFT JOIN comments ON comments.article_id = articles.article_id`;
  const args = [];
  // building up arguments

  // finding topics to compare against
  return db.query(`SELECT * FROM topics;`).then(({ rows }) => {
    const articleTopicsArray = rows.map((topic) => topic.slug);
    if (topicFilter && !articleTopicsArray.includes(topicFilter)) {
      return Promise.reject({ status: 400, error: "Bad Request" });
    } else {
      if (articleTopicsArray.includes(topicFilter)) {
        SQLstring += ` WHERE topic = '${topicFilter}'`;
      }
    }

    SQLstring += " GROUP BY articles.article_id";

    if (sort_by) {
      // setting greenlisted columns
      const validColumnsToSortBy = ["author", "topic", "created_at"];
      if (!validColumnsToSortBy.includes(sort_by)) {
        return Promise.reject({ status: 400, error: "Bad Request" });
      } else {
        if (validColumnsToSortBy.includes(sort_by)) {
          SQLstring += ` ORDER BY ${sort_by}`;
        }
      }
      if (order !== "desc" && order !== "asc") {
        return Promise.reject({ status: 400, error: "Bad Request" });
      } else {
        if (order === "desc" || order === "asc") {
          SQLstring += " " + order;
        }
      }
    }

    return db.query(SQLstring, args).then(({ rows }) => {
      return rows;
    });
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
  if (!username || !article_id) {
    return Promise.reject("Not Found");
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
  return db
    .query(
      `
  SELECT * FROM users;
  `
    )
    .then(({ rows }) => {
      return rows;
    });
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
