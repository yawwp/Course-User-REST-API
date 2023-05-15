let express = require('express');
let router = express.Router();
const moment = require('moment');
const bcrypt = require('bcryptjs');
router.use(express.urlencoded({ extended: true }));
const { authenticatedUser } = require('../middleware/auth-user');

const User = require('../models').User;
const Course = require('../models').Course;

function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next)
    } catch (error) {
      res.status(500).send(error);
    }
  }
}

router.get('/', async function (req, res) {
  res.json({ message: "Root: localhost:5000/api" });
});

router.get('/users', authenticatedUser, asyncHandler(async (req, res) => {
  const currentUser = req.currentUser;
  // console.log(currentUser);
  const { id, firstName, lastName, emailAddress, password } = currentUser.dataValues;
  const user = {
    id: id,
    firstName: firstName,
    lastName: lastName,
    emailAddress: emailAddress,
    password: password
  }
  res.status(200).json(user);
}));


router.post('/users', asyncHandler(async (req, res) => {
  try {
    let { firstName, lastName, emailAddress, password } = req.body;
    console.log(emailAddress);

    !firstName ? firstName = '' : null;
    !lastName ? lastName = '' : null;
    !emailAddress ? emailAddress = '' : null;
    !password ? password = '' : null;

    const user = {
      "firstName": firstName,
      "lastName": lastName,
      "emailAddress": emailAddress,
      "password": password,
      "createAt": moment(),
      "updatedAt": moment()
    };

    await User.create({ user });
    res.location('/').status(201).end();
  } catch (error) {
    console.log('ERROR:', error.name);
    if (error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") {
      const errors = error.errors.map(err => err.message);
      console.log(errors);
      res.status(400).json({ errors })
    } else {
      throw error;
    }
  }
}))
//   const { firstName, lastName, emailAddress, password } = req.body;
//   if (!firstName && !lastName && !emailAddress && !password) {
//     let firstName = '';
//     let lastName = '';
//     let emailAddress = '';
//     let password = '';
//     try {
//       const user = await User.create({
//         firstName,
//         lastName,
//         emailAddress,
//         password,
//         createdAt: moment(),
//         updatedAt: moment(),
//       });
//     res.location('/').status(201).end();
//   } catch (error) {
//       console.log ('ERROR:', error.name);
//       if (error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") {
//         const errors = error.errors.map(err => err.message);
//         console.log(errors);
//         res.status(400).json({errors})
//       } else {
//         throw error;
//       }
//     }
//   } else {
//     try {
//       const user = await User.create({
//         firstName,
//         lastName,
//         emailAddress,
//         password,
//         createdAt: moment(),
//         updatedAt: moment(),
//       });
//     res.location('/').status(201).end();
//   } catch (error) {
//       console.log ('ERROR:', error.name);
//       if (error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") {
//         const errors = error.errors.map(err => err.message);
//         res.status(400).json({errors})
//       } else {
//         throw error;
//       }
//     }
//   }
// }));


/* 
/api/courses GET route that will return all 
courses including the User associated with 
each course and a 200 HTTP status code.
*/
router.get('/courses', asyncHandler(async (req, res) => {
  const courses = await Course.findAll({
    include: {
      model: User,
      attributes: {
        exclude: ['password', 'createdAt', 'updatedAt']
      }
    },
    attributes: {
      exclude: ['createdAt', 'updatedAt']
    }
  });
  res.status(200).json(courses);
}));

/* 
/api/courses/:id GET route that will return the 
corresponding course including the User associated 
with that course and a 200 HTTP status code.
*/
router.get('/courses/:id', asyncHandler(async (req, res) => {
  const course = await Course.findOne({
    include: {
      model: User,
      attributes: {
        exclude: ['password', 'createdAt', 'updatedAt']
      }
    },
    where: { id: req.params.id },
    attributes: {
      exclude: ['createdAt', 'updatedAt']
    },
  })
  res.status(200).json(course);
}))

/*
/api/courses POST route that will create a new course, 
set the Location header to the URI for the newly created 
course, and return a 201 HTTP status code and no content.
*/
router.post('/courses', authenticatedUser, asyncHandler(async (req, res) => {
  try {
    const course = await Course.create({
      title: req.body.title,
      description: req.body.description,
      estimatedTime: req.body.estimatedTime,
      materialsNeeded: req.body.materialsNeeded,
      createdAt: moment(),
      updatedAt: moment(),
      userId: req.body.userId
    })
    const { id } = course;
    res.location(`/courses/${id}`).status(201).end();
  } catch (error) {
    console.log('ERROR:', error.name);
    if (error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") {
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors })
    } else {
      throw error;
    }
  }
}));

/*
/api/courses/:id PUT route that will update the corresponding 
course and return a 204 HTTP status code and no content.
*/
router.put('/courses/:id', authenticatedUser, asyncHandler(async (req, res) => {
  try {
    const course = await Course.findOne({
      include: { model: User },
      where: { id: req.params.id }
    });
    const user = req.currentUser;
    if (user.id === course.userId) {
      await course.update({
        title: req.body.title,
        description: req.body.description,
        estimatedTime: req.body.estimatedTime,
        materialsNeeded: req.body.materialsNeeded,
        createdAt: req.body.createdAt,
        updatedAt: req.body.updatedAt,
        userId: req.body.userId
      });
      res.status(204).end();
    } else {
      res.status(401).json({ error: "Unauthorized Login" });
    }
  } catch (error) {
    console.log('ERROR:', error.name);
    if (error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") {
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors })
    } else {
      throw error;
    }
  }
}))

/* 
/api/courses/:id DELETE route that will delete the 
corresponding course and return a 204 HTTP status 
code and no content.
*/
router.delete('/courses/:id', authenticatedUser, asyncHandler(async (req, res) => {
  const user = req.currentUser;
  const course = await Course.findOne({
    include: { model: User },
    where: { id: req.params.id }
  })
  if (user.id === course.userId) {
    await Course.destroy({
      where: { id: req.params.id }
    });
    res.status(204).end();
  } else {
    res.status(401).json({ error: "Unauthorized Login" });
  }
}));

module.exports = router; 