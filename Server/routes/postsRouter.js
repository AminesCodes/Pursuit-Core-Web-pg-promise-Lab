const express = require('express');

//pg-promise setup
const pgp = require ('pg-promise')(); // CALL OG THE FUNCTION => like pgp()
const connectionString = 'postgres://localhost:5432/my_facebook_db'; //URL where Postgres is running
const db = pgp(connectionString); //connected DB instance

const router = express.Router();


// GET ALL POSTS
router.get('/all', async (req, res) => {
  try {
    let allPosts = await db.any('SELECT * FROM posts');
      res.json({
        status: 'success',
        message: allPosts
      });
  } catch(err) {
    console.log(err) 
    res.status(500)
    res.send({
      status: 'failed',
      message: 'Something went wrong'
    });
  }
});

//GET ALL POSTS OF A SPECIFIC USER
router.get('/:userID', async (req, res) => {
    const id = parseInt(req.params.userID);

    if (isNaN(id)) {
        res.status(500);
        res.json({
          status: 'failed',
          message: 'Invalid route'
        });
    } else {
        try {
          let userPosts = await db.any('SELECT * FROM posts WHERE poster_id = $1', [id]);
            res.json({
              status: 'success',
              message: userPosts
            });
        } catch(err) {
          console.log(err) 
          res.status(500)
          res.send({
            status: 'failed',
            message: 'Something went wrong'
          });
        }
    }
  });

// POST A NEW POST (EXPECTS IN THE BODY body)
router.post('/:userID/register', async (req, res) => {
    const id = parseInt(req.params.userID);
    const userPost = req.body.body;

    if (isNaN(id)) {
        res.status(500);
        res.json({
          status: 'failed',
          message: 'Invalid route'
        });
    } else if (!userPost) {
        res.status(500);
        res.json({
            status: 'failed',
            message: 'Missing information or invalid form'
        });
    } else {
        try {
            let insertQuery = `INSERT INTO posts (poster_id, body) 
            VALUES($1, $2)`
            await db.none(insertQuery, [id, userPost])
        } catch (err) {
            console.log(err);
            res.json({
                status: 'failed',
                message: 'Something went wrong'
            })
        }

        try {
            let addedPost = await db.one(`SELECT * FROM posts WHERE poster_id = $1 AND body = $2 ORDER BY id DESC LIMIT 1`, [id, body])
            res.json({
                status: 'success',
                message: addedPost
            })
        } catch (err) {
            console.log(err);
            res.json({
                status: 'failed',
                message: 'Something went wrong'
            })
        }
    }
});

// EDITING A POST, EXPECTING A BODY WITH THE POSTS BODY
router.patch('/:userID/:postID', async (req, res) => {
  const user_id = parseInt(req.params.userID);
  const post_id = parseInt(req.params.postID);
  const userPost = req.body.body;

  if (isNaN(user_id) || isNaN(post_id) ) {
    res.status(500);
    res.json({
      status: 'failed',
      message: 'Invalid route'
    });

  } else if (!userPost) {
    res.status(500);
    res.json({
      status: 'failed',
      message: 'Missing information'
    });

  } else {
    try {
      let updateQuery = `UPDATE posts 
      SET body = $3 
      WHERE id = $1 AND poster_id = $2`
      await db.none(updateQuery, [post_id, user_id, userPost])
    } catch (err) {
      console.log(err);
      res.json({
        status: 'failed',
        message: 'Something went wrong'
      })
    }
      try {
        let editedPost = await db.one(`SELECT * FROM posts WHERE id = $1`, [post_id])
        res.json({
          status: 'success',
          message: editedPost
        })
      } catch (err) {
        console.log(err);
        res.json({
          status: 'failed',
          message: 'Something went wrong'
        })
    }
  }
});


// DELETING A POST
router.delete('/:userID/:postID', async (req, res) => {
    const user_id = parseInt(req.params.userID);
    const post_id = parseInt(req.params.postID);
  
    if (isNaN(user_id) || isNaN(post_id) ) {
      res.status(500);
      res.json({
        status: 'failed',
        message: 'Invalid route'
      });
    } else {
        let postToDelete;
        try {
            postToDelete = await db.one(`SELECT * FROM posts WHERE id = $1`, [post_id])
        } catch (err) {
            console.log(err);
            res.json({
                status: 'failed',
                message: 'Something went wrong'
            })
        }
        try {
            let deleteQuery = `DELETE FROM posts WHERE id = $1 AND poster_id = $2`
            await db.none(deleteQuery, [post_id, user_id]);
            if (postToDelete) {
                res.json({
                    status: 'success',
                    message: postToDelete
                })
            } else {
                res.json({
                    status: 'failed',
                    message: 'Post / user does not exist'
                })
            }
        } catch (err) {
            console.log(err);
            res.json({
                status: 'failed',
                message: 'Something went wrong'
            })
        }
    }
});


module.exports = router;