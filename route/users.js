const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');


require('dotenv').config();

//Initiate Discord OAuth Client
// const Client = new OAuthClient(process.env.DISCORD_ID,process.env.DISCORD_SECRET).setScopes('identify','email').setRedirect(process.env.HOST+'/users/discordauthed');



// Load User model
const User = require('../models/User');
User.collection.createIndex({"email":1},{unique: true});

//Load Notification Model
const Notification = require('../models/Notification');

const { forwardAuthenticated } = require('../config/auth');

//Default index page for user
router.get('/',(req,res) => { res.redirect('login')});

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

//Discord Public Page
router.get('/discord', forwardAuthenticated, (req,res) => res.redirect(Client.authCodeLink));

// Register
router.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Lütfen tüm alanları girin' });
  }

  if (password != password2) {
    errors.push({ msg: 'Parola uyuşmuyor' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Şifre en az 6 karakterden oluşmalıdır' });
  }

  if (errors.length > 0) {
    res.render('Kayıt ol', {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Bu e-posta zaten var' });
        res.render('Kayıt ol', {
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        const newUser = new User({
          name,
          email,
          password
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'Artık kayıt oldunuz ve giriş yapabilirsiniz'
                );
                res.redirect('/users/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});


// Login
router.post('/login',
  passport.authenticate('local', {
    failureRedirect: '/users/login',
    failureFlash: true
  }),async (req, res) => {
    try {
      const newNotification = new Notification({
        messageType:"loginSuccess",
        message:"Successfully logged in from "+req.ip.toString()+" using agent"+req.headers['user-agent'],
        userid:req.user.id,
      });
      await newNotification.save();
      res.redirect('/dashboard',);
    } catch(err) {
      console.log(err);
      
    }

  }
);

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'Çıkış Yapıldı');
  res.redirect('/users/login');
});

module.exports = router;