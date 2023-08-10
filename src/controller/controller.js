const {
  User,
  Details
} = require('../models');
const {
  getUserInfoFromToken
} = require('../middleware/authentication');
const {
  generateToken
} = require('../utils/tokenUtils');
const bcrypt = require('bcrypt');
const {
  s3Upload
} = require('../config/awsService.js');
const passport = require('passport');
const auth = require('../middleware/auth');



class UserController {

  async googleAuth(req, res, next) {
    passport.authenticate('google', { scope: ['email', 'profile'] })(req, res, next);
  }

  async googleCallback(req, res, next) {
    passport.authenticate('google', {
      successRedirect: '/hi', // Replace with your success route
      failureRedirect: '/auth/google/failure',
    })(req, res, next);
  }

  async hi(req, res) {
    res.send('Hi');
  }

  async googleFailure(req, res) {
    res.status(401).json({
      error: 'Google authentication failed',
    });
  }

  // async registerUser(req, res) {
  //   try {
  //     // Extract user information from Google profile
  //     const googleProfile = req.user;
  //     const { id, displayName, emails } = googleProfile;

  //     // Check if the user already exists in the database
  //     const existingUser = await User.findOne({
  //       where: { googleId: id },
  //     });

  //     if (existingUser) {
  //       // User already exists, generate token and send response
  //       const token = generateToken({
  //         id: existingUser.id,
  //         name: existingUser.username, // Assuming you have a username field
  //         email: emails[0].value,
  //         // Other user information...
  //       });

  //       return res.json({ token });
  //     }

  //     // User doesn't exist, create a new user
  //     const user = await User.create({
  //       googleId: id,
  //       email: emails[0].value,
  //       // Other user information...
  //     });

  //     // Generate token and send response
  //     const token = generateToken({
  //       id: user.id,
  //       name: user.username,
  //       email: user.email,
  //       // Other user information...
  //     });

  //     res.json({ token });
  //   } catch (error) {
  //     res.status(400).json({
  //       error: error.message,
  //     });
  //   }
  // }


  async registerUser(req, res) {
    try {
      const {
        email,
        password,
        username,
        bio
      } = req.body;
      const file = req.file;

      // Perform user registration logic (e.g., validation, creating user in the database)

      let fileName = null;
      if (file) {
        // Upload the image to S3
        await s3Upload(file);

        // Access the uploaded file name
        fileName = file.originalname;
      }

      // Save the user in the database
      const user = await User.create({
        email,
        password,
        username,
        bio,
        profile_image: fileName,
      });

      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  }

  async login(req, res) {
    try {
      const {
        email,
        password
      } = req.body;

      // Find the user by email
      const user = await User.findOne({
        where: {
          email
        }
      });

      // If user not found, return error
      if (!user) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      // Compare the provided password with the hashed password in the database
      const isPasswordValid = await bcrypt.compare(password, user.password);

      // If passwords don't match, return error
      if (!isPasswordValid) {
        return res.status(401).json({
          error: 'Invalid password'
        });
      }

      // Generate the full path and full name of the profile image in the S3 bucket
      const fileName = user.profile_image;
      const imagePath = `https://ninja-bucket66.s3.us-east-1.amazonaws.com/uploads/${fileName}`;

      // Generate a JWT token with the full path and full name of the profile image
      const token = generateToken({
        id: user.id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        profileImage: {
          path: imagePath, // Full path to the profile image
        }
      });

      res.json({
        token
      });
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  }

  async addDetails(req, res) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const userInfo = getUserInfoFromToken(token);

      const { id } = userInfo; // Extract user ID from the decoded token

      const { title, url, description } = req.body;

      // Check if the user exists
      const user = await User.findByPk(id);

      // If user not found, return error
      if (!user) {
        return res.status(404).json({
          error: 'User not found',
        });
      }

      // Create details record for the user
      const details = await Details.create({
        userId: id, // Associate the details with the user's ID
        title,
        url,
        description,
      });

      res.status(201).json("Details added successfully"); // Return the details object that was added to the database
    } catch (error) {
      res.status(400).json({
        error: error.message,
      });
    }
  }

  async getDetails(req, res) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const userInfo = getUserInfoFromToken(token);

      const { id } = userInfo; // Extract user ID from the decoded token

      // Find the details based on the user ID and only include the specified fields
      const details = await Details.findAll({
        where: {
          userId: id, // Use "userId" instead of "id" to filter by the correct field
        },
        attributes: ['title', 'url', 'description'], // Include only these fields
      });

      // If details not found, return error
      if (!details || details.length === 0) {
        return res.status(404).json({
          ok: false,
          error: 'Details not found',
        });
      }

      res.json({
        ok: true,
        details, // Include the details in the response
      });
    } catch (error) {
      res.status(400).json({
        ok: false,
        error: error.message,
      });
    }
  }


  async updateDetails(req, res) {
    try {
      const {
        detailsId
      } = req.params;
      const {
        title,
        url,
        description
      } = req.body;

      // Find the details based on the user ID and details ID
      let details = await Details.findOne({
        where: {
          id: detailsId,
        }
      });

      // If details not found, return error
      if (!details) {
        return res.status(404).json({
          error: 'Details not found'
        });
      }

      // Update the details
      details = await details.update({
        title,
        url,
        description
      });

      res.json("selected detail has been updated successfully!");
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  }

  async deleteDetails(req, res) {
    try {
      const {
        detailsId
      } = req.params;

      // Find the details based on the user ID and details ID
      let detail = await Details.findOne({
        where: {
          id: detailsId,
        }
      });

      // If detail not found, return error
      if (!detail) {
        return res.status(404).json({
          error: 'Detail not found'
        });
      }

      // Delete the detail
      await detail.destroy();

      res.json({
        message: 'Detail deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  }

  async getProfile(req, res) {
    const userInfo = getUserInfoFromToken(req.headers.authorization.split(' ')[1]);

    // Extract the file name from the profile image
    const fileName = userInfo.profileImage;

    // Construct the profile response with the full path to the profile picture
    const profileResponse = {
      user: {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        bio: userInfo.bio,
        profileImage: fileName
      }
    };

    res.json(profileResponse);
  }

  async updateUserProfile(req, res) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const userInfo = getUserInfoFromToken(token);

      const {
        id
      } = userInfo; // Extract user ID from the decoded token
      const {
        username,
        bio
      } = req.body;
      const file = req.file; // Get the uploaded profile image file

      // Find the user in the database
      const user = await User.findByPk(id);

      // If user not found, return error
      if (!user) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      // Upload the new profile image if provided
      let fileName = user.profile_image; // Default to the current profile image
      if (file) {
        // Upload the new image to S3
        await s3Upload(file);
        fileName = file.originalname;
      }

      // Update the user's profile
      user.username = username;
      user.bio = bio;
      user.profile_image = fileName;

      await user.save();

      // Construct the updated profile response
      const updatedProfile = {
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: user.id,
          username: user.username,
          bio: user.bio,
          profileImage: {
            path: `https://ninja-bucket66.s3.us-east-1.amazonaws.com/uploads/${fileName}`, // Full path to the new profile image
          },
        },
      };

      res.json(updatedProfile);
    } catch (error) {
      res.status(400).json({
        error: error.message,
      });
    }
  }

  async getDetailAnalytics(req, res) {
    try {
      const {
        detailsId
      } = req.params;

      // Find the detail by ID
      const detail = await Details.findByPk(detailsId);

      // If detail not found, return error
      if (!detail) {
        return res.status(404).json({
          error: 'Detail not found',
        });
      }

      // Construct the analytics response with the stored clicks and visits count
      const analyticsResponse = {
        success: true,
        message: 'Analytics retrieved successfully',
        analytics: {
          clicks: detail.clicks,
          visits: detail.visits,
        },
      };

      res.json(analyticsResponse);
    } catch (error) {
      res.status(400).json({
        error: error.message,
      });
    }
  }

  async getProfileByUsername(req, res) {
    try {
      const {
        username
      } = req.params;

      // Find the user by username
      const user = await User.findOne({
        where: {
          username
        }
      });

      // If user not found, return error
      if (!user) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      // Retrieve the user's profile information
      const {
        email,
        bio,
        profile_image
      } = user;

      // Find the details associated with the user
      const details = await Details.findAll({
        where: {
          userId: user.id
        }
      });

      // Construct the profile response
      const profileResponse = {
        success: true,
        message: 'Profile retrieved successfully',
        user: {
          email,
          bio,
          profileImage: {
            path: `https://ninja-bucket66.s3.us-east-1.amazonaws.com/uploads/${profile_image}`, // Full path to the profile image
          },
        },
        links: details.map(detail => ({
          title: detail.title,
          url: detail.url,
          description: detail.description
        }))
      };

      res.json(profileResponse);
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  }

}

module.exports = UserController;