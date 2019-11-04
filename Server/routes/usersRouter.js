const express = require('express');

//pg-promise setup
const pgp = require ('pg-promise')(); // CALL OG THE FUNCTION => like pgp()
const connectionString = 'postgres://localhost:5432/my_facebook_db'; //URL where Postgres is running
const db = pgp(connectionString); //connected DB instance

const router = express.Router();

const getAllUsers = async (request, response, next) => {
  try {
    let allUsers = await db.any('SELECT * FROM users');
    request.allUsers = allUsers;
    next();
  } catch(err) {
    console.log(err) 
    response.status(500)
    response.send({
      status: 'failed',
      message: 'Something went wrong'
    });
  }
}

const returnAllUsers = (request, response) => {
  response.json({
    status: 'success',
    message: request.allUsers
  });
}

router.get('/all', getAllUsers, returnAllUsers);

const formateName = (str) => {
  return (str[0].toUpperCase()+(str.slice(1, str.length)).toLowerCase());
}

const checkValidBody = (request, response, next) => {
  request.firstName = formateName(request.body.firstname);
  request.lastName = formateName(request.body.lastname);
  request.age = parseInt(request.body.age);

  if (!request.firstName || !request.lastName || !request.age || isNaN(parseInt(request.age))) {
    response.status(500);
    response.json({
      status: 'failed',
      message: 'Missing information or invalid form'
    });
  } else {
    next();
  }
}

const checkExistentUser = (request, response, next) => {
  let userExists = false;

  for (let user of request.allUsers) {
    if (user.firstname === request.firstName 
        && user.lastname === request.lastName 
        && user.age === request.age) {
          userExists = true;
          request.userToLog = user;
          break;
    }
  }
  request.userExists = userExists;
  next();
}

const addUser = async (request, response, next) => {
  if (request.userExists) {
    response.status(203);
    response.json({
      status: 'failed',
      message: 'User exists already'
    });
  } else {
    try {
      const insertQuery = `INSERT INTO users (firstname, lastname, age) 
      VALUES($1, $2, $3)`
      await db.none(insertQuery, [request.firstName, request.lastName, request.age]);
      next();
    } catch (err) {
      console.log(err);
      response.json({
        status: 'failed',
        message: 'Something went wrong'
      })
    }
  }
}

const getConcernedUser = async (request, response) => {
  try {
    let registeredUser = await db.one(`SELECT * FROM users WHERE firstname = $1 AND lastname = $2 AND age = $3 ORDER BY id DESC LIMIT 1`, [request.firstName, request.lastName, request.age])
    response.json({
      status: 'success',
      message: registeredUser
    });
  } catch (err) {
    console.log(err);
    response.json({
      status: 'failed',
      message: 'Something went wrong'
    })
}
}


router.post('/register', checkValidBody, getAllUsers, checkExistentUser, addUser, getConcernedUser);

const userToLog = (request, response) => {
  if (request.userExists) {
    response.json({
      status: 'success',
      message: request.userToLog
    })
  } else {
    response.json({
      status: 'failed',
      message: 'User does not exist'
    })
  }
}

// NOT A REAL PATCH, JUST TO HAVE A ABILITY TO ACCEPT A BODY
// LOGIN A USER
router.patch('/login', checkValidBody, getAllUsers, checkExistentUser, userToLog);


const checkValidRoute = (request, response, next) => {
  const id = parseInt(request.params.userID);
  if (isNaN(id)) {
    response.status(500);
    response.json({
      status: 'failed',
      message: 'Invalid route'
    });
  } else {
    request.id = id;
    next();
  }
}


const getUserByID = async (request, response, next) => {
  try {
    const targetUser = await db.one('SELECT * FROM users WHERE id = $1', [request.id]);
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

const updateUser = async (request, response, next) => {
  try {
    let updateQuery = `UPDATE users 
    SET firstname = $2, lastname = $3, age = $4 
    WHERE id = $1`
    await db.none(updateQuery, [request.id, request.firstName, request.lastName, request.age]);
    next();
  } catch (err) {
    console.log(err);
    response.json({
      status: 'failed',
      message: 'Something went wrong'
    });
  }
}

const returnUserByID = (request, response) => {
  response.json({
    status: 'success',
    message: request.targetUser
  })
}
// EXPECTING A BODY WITH {firstname, lastname, age}
router.put('/:userID', checkValidRoute, checkValidBody, getUserByID, updateUser, getUserByID, returnUserByID);


const deleteUser = async (request, response) => {
  try {
    let deleteQuery = `DELETE FROM users WHERE id = $1`
    await db.none(deleteQuery, [request.id]);
    response.json({
      status: 'success',
      message: request.targetUser
    })
  } catch (err) {
    console.log(err);
    response.json({
      status: 'failed',
      message: 'Something went wrong'
    })
  }
}
// DELETING A USER
router.delete('/:userID', checkValidRoute, getUserByID, deleteUser);


module.exports = router;