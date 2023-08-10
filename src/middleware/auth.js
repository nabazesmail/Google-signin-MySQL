const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;

const {
  User
} = require('../models'); // Import your User model
const {
  generateToken,
  generateTemporaryPassword
} = require('../utils/tokenUtils'); // Import your token generation function and temporary password generation function

passport.use(
  new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/callback',
      passReqToCallback: true,
    },
    async function (request, accessToken, refreshToken, profile, done) {
      try {
        // Check if the user already exists in the database based on email
        let user = await User.findOne({
          where: {
            email: profile.email
          }
        });

        if (!user) {
          // If user doesn't exist, generate a unique temporary password
          const temporaryPassword = generateTemporaryPassword(); // Generate a unique temporary password

          console.log(temporaryPassword);
          // Create a new user record
          user = await User.create({
            email: profile.email,
            username: profile.displayName,
            password: temporaryPassword,
            profile_image: profile.picture,
            // You can add other properties here if needed
          });
        }

        // Generate JWT token
        const token = generateToken({
          id: user.id,
          email: user.email,
          username: user.username,
        });

        return done(null, {
          user,
          token
        });
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});