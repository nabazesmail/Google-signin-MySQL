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


class UserController {

  async registerUser(req, res) {
    try {
      const {
        email,
        password,
        username,
        bio
      } = req.body;

      // Check if a file is attached in the request
      if (!req.file) {
        // Handle the case when no file is attached
        // Perform user registration logic without the file upload
        const user = await User.create({
          email,
          password,
          username,
          bio,
        });

        return res.status(201).json(user);
      }

      // Perform user registration logic (e.g., validation, creating user in the database)

      // Upload the image to S3
      await s3Upload(req.file);

      // Save the user in the database (excluding image URL for simplicity)
      const user = await User.create({
        email,
        password,
        username,
        bio,
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

      // Generate a JWT token
      const token = generateToken({
        id: user.id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        profileImage: user.profile_image
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
      const {
        userId,
        title,
        url,
        description
      } = req.body;

      // Check if the user exists
      const user = await User.findByPk(userId);

      // If user not found, return error
      if (!user) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      // Create details record for the user
      const details = await Details.create({
        userId,
        title,
        url,
        description
      });

      res.status(201).json(details);
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  }

  async getDetails(req, res) {
    try {
      const {
        userId
      } = req.params;

      // Find the details based on the user ID
      const details = await Details.findAll({
        where: {
          userId
        }
      });

      // If details not found, return error
      if (!details) {
        return res.status(404).json({
          error: 'Details not found'
        });
      }

      res.json(details);
    } catch (error) {
      res.status(400).json({
        error: error.message
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

      res.json(details);
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
    res.json(userInfo);
  }

  async updateUserProfile(req, res) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const userInfo = getUserInfoFromToken(token);

      const {
        id
      } = userInfo; // Extract user ID from the decoded token
      const {
        name,
        email,
        bio,
        profileImage
      } = req.body;

      // Find the user in the database
      const user = await User.findByPk(id);

      // If user not found, return error
      if (!user) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      // Update the user's profile
      user.name = name;
      user.email = email;
      user.bio = bio;
      user.profileImage = profileImage;

      await user.save();

      // Construct the updated profile response
      const updatedProfile = {
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          bio: user.bio,
          profileImage: user.profileImage,
          profileLink: `https://example.com/profile/${user.name.toLowerCase().replace(/\s+/g, '_')}`
        }
      };

      res.json(updatedProfile);
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  }

  async getDetailAnalytics(req, res) {
    try {
      const {
        detailId
      } = req.params;

      // Find the detail by ID
      const detail = await Details.findByPk(detailId);

      // If detail not found, return error
      if (!detail) {
        return res.status(404).json({
          error: 'Detail not found'
        });
      }

      // Increment the clicks count for the detail
      detail.clicks += 1;

      // Increment the visits count for the detail
      detail.visits += 1;

      // Save the changes to the detail
      await detail.save();

      // Construct the analytics response
      const analyticsResponse = {
        success: true,
        message: 'Analytics retrieved successfully',
        analytics: {
          clicks: detail.clicks,
          visits: detail.visits
        }
      };

      res.json(analyticsResponse);
    } catch (error) {
      res.status(400).json({
        error: error.message
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
          profile_image
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