const nodemailer = require("nodemailer");

const testAccount = {
    user: 'eino13@ethereal.email',
    pass: 'xkmGBJ5hBEyfdkHMbh'
}

const transporter = nodemailer.createTransport({
host: "smtp.ethereal.email",
port: 587,
secure: false, // true for 465, false for other ports
auth: {
    user: testAccount.user, // generated ethereal user
    pass: testAccount.pass, // generated ethereal password
    },
});

const sendWelcomeEmail = async (email, name) => {
    transporter.sendMail({
        from: 'almano@taskapp.co', // sender address
        to: email, // list of receivers
        subject: "Welcome to our Task App!", // Subject line
        text: `Welcome to the app, ${name}. Hope you enjoy our service!` // plain text body
      });
}

const sendCancellationEmail = async (email, name) => {
    transporter.sendMail({
        from: 'almano@taskapp.co', // sender address
        to: email, // list of receivers
        subject: "It's hard to say goodbye!", // Subject line
        text: `We are sorry to see you go, ${name}! Would you be so kind to leave us some feedback as to why you left?` // plain text body
      });
}
module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}