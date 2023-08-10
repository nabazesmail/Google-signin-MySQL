const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;

const { User } = require('../models'); // Import your User model
const { generateToken } = require('../utils/tokenUtils'); // Import your token generation function

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret:  process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/callback',
      passReqToCallback: true,
    },
     async function (request, accessToken, refreshToken, profile, done) {
      try {
        // Check if the user already exists in the database based on email
        let user = await User.findOne({ where: { email: profile.email } });

        if (!user) {
          // If user doesn't exist, create a new user record
          const temporaryPassword = "temporary123"; // Use a static temporary password
          user = await User.create({
            email: profile.email,
            username: profile.displayName,
            password: temporaryPassword, // Set the temporary password
            // You can add other properties here if needed
          });

          // // Perform password validation
          // const validationResult = await user.validatePassword();
          // if (validationResult !== true) {
          //   // Handle validation error, e.g., delete the user record and return an error response
          //   await user.destroy();
          //   return done(validationResult, null);
          // }
        }

        // Generate JWT token
        const token = generateToken({
          id: user.id,
          email: user.email,
          username: user.username,
        });
        console.log(token)
        return done(null, { user, token });
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
