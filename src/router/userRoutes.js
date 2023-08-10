const express = require('express');
const UserController = require('../controller/controller');
const userController = new UserController();
const {authenticate} = require('../middleware/authentication');
const upload = require('../config/multerConfig');
const router = express.Router();

// Google OAuth routes
router.get('/auth/google', userController.googleAuth);

router.get('/auth/google/callback', userController.googleCallback);

router.get('/token', userController.getToken);

router.get('/auth/google/failure', userController.googleFailure);


// Route for registering user
router.post("/register", upload.single("profile_image"), userController.registerUser);

// Route for logging in
router.post('/login', userController.login);

// Route for authenticating user
router.use(authenticate);

// Route for adding information to the Details table based on user's ID
router.post('/details', userController.addDetails);

// Route for getting information from the Details table based on user's ID
router.get('/details', userController.getDetails);

// Route for updating information in the Details table based on user's ID and details ID
router.put('/details/:detailsId', userController.updateDetails);

// Route for deleting a detail from the Details table based on user's ID and details ID
router.delete('/details/:detailsId', userController.deleteDetails);

// Route for getting user profile
router.get('/profile', userController.getProfile);

// Update user profile with uploaded profile image
router.put('/profile', upload.single('profile_image'), userController.updateUserProfile);

// Route for getting analytics for a specific detail
router.get('/details/:detailsId/analytics', authenticate, userController.getDetailAnalytics);

// Route for getting user profile by username
router.get('/profile/:username', userController.getProfileByUsername);


module.exports = router;