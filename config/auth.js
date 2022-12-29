module.exports = {
    ensureAuthenticated: function(req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      }
      req.flash('error_msg', 'Bu kaynağı görüntülemek için lütfen giriş yapın');
      res.redirect('/users/login');
    },
    ensureAuthenticatedAdmin: function(req, res, next) {
      if (req.isAuthenticated() && req.user.isAdmin) {
        return next();
      }
      req.flash('error_msg', 'Lütfen geçerli bir yönetici hesabıyla oturum açın');
      res.redirect('/users/login');
    },
    forwardAuthenticated: function(req, res, next) {
      if (!req.isAuthenticated()) {
        return next();
      }
      res.redirect('/dashboard');
    }
};