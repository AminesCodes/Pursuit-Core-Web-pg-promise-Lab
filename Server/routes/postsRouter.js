const express = require('express');

//pg-promise setup
const pgp = require ('pg-promise')(); // CALL OG THE FUNCTION => like pgp()
const connectionString = 'postgres://localhost:5432/my_facebook_db'; //URL where Postgres is running
const db = pgp(connectionString); //connected DB instance

const router = express.Router();


const getAllPosts = async (request, response, next) => {
    try {
      let allPosts = await db.any('SELECT * FROM users JOIN posts ON users.id = poster_id');
      response.json({
        status: 'success',
        message: allPosts
      });
    } catch(err) {
      console.log(err) 
      response.status(300)
      response.send({
        status: 'failed',
        message: 'Something went wrong'
      });
    }
}
  
  
// GET ALL POSTS
router.get('/all', getAllPosts);



const checkValidRoute = (request, response, next) => {
    console.log('checkValidRoute')
    const id = parseInt(request.params.userID);
    const postID = parseInt(request.params.postID)
    if (isNaN(id) || (request.params.postID && isNaN(postID))) {
      response.status(300);
      response.json({
        status: 'failed',
        message: 'Invalid route'
      });
    } else {
        if (postID) {
            request.postID = postID
        }
        request.userID = id;
        next();
    }
  }

const getAllPostsByUserID = async (request, response) => {
    console.log('getAllPostsByUserID')
    try {
        let userPosts = await db.any('SELECT * FROM users JOIN posts ON users.id = poster_id WHERE poster_id = $1', [request.userID]);
          response.json({
            status: 'success',
            message: userPosts
          });
      } catch(err) {
        console.log(err) 
        response.status(300)
        response.send({
          status: 'failed',
          message: 'Something went wrong or inexistent user or user does not have any post'
        });
      }
  }

//GET ALL POSTS OF A SPECIFIC USER
router.get('/:userID', checkValidRoute, getAllPostsByUserID);


const checkValidBody = (request, response, next) => {
    console.log('checkValidBody')
    request.postBody = (request.body.body);
  
    if (!request.postBody) {
      response.status(300);
      response.json({
        status: 'failed',
        message: 'Missing information'
      });
    } else {
      next();
    }
  }

const getUserByID = async (request, response, next) => {
    console.log('getUserByID')
    try {
      const targetUser = await db.one('SELECT * FROM users WHERE id = $1', [request.userID]);
      if (targetUser.id) {
        request.targetUser = targetUser;
        next();
      } 
    } catch (err) {
      console.log(err);
      response.json({
        status: 'failed',
        message: 'Something went wrong or inexistent user'
      });
    }
}

const addPost = async (request, response, next) => {
    console.log('addPost')
    try {
        let insertQuery = `INSERT INTO posts (poster_id, body) 
        VALUES($1, $2)`
        await db.none(insertQuery, [request.targetUser.id, request.postBody]);
        next();
    } catch (err) {
        console.log(err);
        response.json({
            status: 'failed',
            message: 'Something went wrong'
        })
    }
}


const getTheAddedPost = async (request, response) => {
    console.log('getTheAddedPost')
    try {
        let addedPost = await db.one(`SELECT * FROM posts WHERE poster_id = $1 AND body = $2 ORDER BY id DESC LIMIT 1`, [request.targetUser.id, request.postBody])
        response.json({
            status: 'success',
            message: addedPost
        })
    } catch (err) {
        console.log(err);
        response.json({
            status: 'failed',
            message: 'Something went wrong'
        })
    }
}

// POST A NEW POST (EXPECTS IN THE BODY body)
router.post('/:userID/register', checkValidRoute, checkValidBody, getUserByID, addPost, getTheAddedPost);

const checkExistingPost = async (request, response, next) => {
    console.log('checkExistingPost')
    try {
        let targetPost = await db.one('SELECT * FROM posts WHERE id = $2 AND poster_id = $1 ', [request.targetUser.id, request.postID])
        request.targetPost = targetPost;
        next();
    } catch (err) {
        console.log(err);
        response.status(300);
        response.json({
            status: 'failed',
            message: 'Something went wrong'
        });
    }
}

const updatePost = async (request,response, next) => {
    console.log('updatePost')
    try {
        let updateQuery = `UPDATE posts 
        SET body = $3 
        WHERE id = $1 AND poster_id = $2`
        await db.none(updateQuery, [request.targetPost.id, request.targetUser.id, request.postBody]);
        next();
    } catch (err) {
        console.log(err);
        response.status(300);
        response.json({
            status: 'failed',
            message: 'Something went wrong'
        });
    }
}

const getUpdatedPost = async (request, response) => {
    console.log('getUpdatedPost')
    try {
        let updatedPost = await db.one(`SELECT * FROM posts WHERE poster_id = $1 AND id = $2`, [request.targetUser.id, request.targetPost.id])
        response.json({
            status: 'success',
            message: updatedPost
        })
    } catch (err) {
        console.log(err);
        response.status(300);
        response.json({
            status: 'failed',
            message: 'Something went wrong'
        });
    }
}
// EDITING A POST, EXPECTING A BODY WITH THE POSTS BODY
router.patch('/:userID/:postID', checkValidRoute, checkValidBody, getUserByID, checkExistingPost, updatePost, getUpdatedPost)

const deletePost = async (request, response) => {
    console.log('deletePost')
    try {
        let deleteQuery = `DELETE FROM posts WHERE id = $1 AND poster_id = $2`
        await db.none(deleteQuery, [request.targetPost.id, request.targetUser.id]);
        response.json({
            status: 'success',
            message: request.targetPost
        })
    } catch (err) {
        console.log(err);
        response.json({
            status: 'failed',
            message: 'Something went wrong'
        })
    }
}

// DELETING A POST
router.delete('/:userID/:postID', checkValidRoute, getUserByID, checkExistingPost, deletePost)


module.exports = router;