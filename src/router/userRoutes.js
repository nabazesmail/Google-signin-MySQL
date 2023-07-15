const express = require('express');
const UserController = require('../controller/controller');
const userController = new UserController();
const {authenticate} = require('../middleware/authentication');
const router = express.Router();


// Route for registering user
router.post('/register',userController.createUser);

// Route for logging in
router.post('/login', userController.login);

// Route for authenticating user
router.use(authenticate);

// Route for adding information to the Details table based on user's ID
router.post('/details', userController.addDetails);

// Route for getting information from the Details table based on user's ID
router.get('/details/:userId', userController.getDetails);

// Route for updating information in the Details table based on user's ID and details ID
router.put('/details/:detailsId', userController.updateDetails);

// Route for deleting a detail from the Details table based on user's ID and details ID
router.delete('/details/:detailsId', userController.deleteDetails);

// Route for getting user profile
router.get('/profile', userController.getProfile);

// Route for updating user's profile based on JWT token
router.put('/profile', userController.updateUserProfile);

// Route for getting analytics for a specific detail
router.get('/details/:detailId/analytics', userController.getDetailAnalytics);


module.exports = router;