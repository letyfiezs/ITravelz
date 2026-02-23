const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });

passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  process.env.GOOGLE_CALLBACK_URL ||
                    `${process.env.BACKEND_URL || 'http://localhost:10000'}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email  = profile.emails?.[0]?.value;
        const avatar = profile.photos?.[0]?.value;
        const name   = profile.displayName;

        // 1) existing Google user
        let user = await User.findOne({ googleId: profile.id });
        if (user) return done(null, user);

        // 2) existing local account with same email → link it
        if (email) {
          user = await User.findOne({ email });
          if (user) {
            user.googleId     = profile.id;
            user.authProvider = 'google';
            if (!user.avatar && avatar) user.avatar = avatar;
            await user.save();
            return done(null, user);
          }
        }

        // 3) brand new user via Google
        user = await User.create({
          name,
          email,
          googleId:     profile.id,
          authProvider: 'google',
          avatar,
          isEmailVerified: true,
        });

        return done(null, user, { isNew: true });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// We don't use sessions — token is passed via URL — but passport needs these stubs
passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = { passport, generateToken };
