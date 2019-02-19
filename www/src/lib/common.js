const pad = require('pad');

module.exports = {
  random: function(d) {
    return pad(d, String(Math.floor(Math.random() * Math.pow(10, d))), '0');
  },

  upperFirst: function(w) { 
    w = w.trim();
    if (w) {
      w = w.toLowerCase();
      w = w[0].toUpperCase() + w.slice(1, w.length);
    }
    return w;
  },

  mailCode: function(email, msg, callback) {
    const mailer = require('nodemailer');
    var transporter = mailer.createTransport({
      service: 'gmail',
      auth: {
        user: '<admin>@gmail.com',
        pass: '<pass>'
      }
    });

    transporter.sendMail({
      from: '"Admin" <no-reply@gwampi.com>',
      replyTo: 'no-reply@gwampi.com',
      to: email,
      subject: 'Mail from Gwampi!',
      html: msg
    }, callback);
  },
};
