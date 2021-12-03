const mailgun = require('mailgun-js');
const api_key = process.env.mailgun_api
const DOMAIN = process.env.mailgun_domain
const mg = mailgun({apiKey: api_key, domain: DOMAIN});

const sendWelcomemail = (email,name) =>{
    mg.messages().send({
        from: 'arunneelamana10@gmail.com',
        to: email,
        subject: 'Welcome to Company',
        text: 'Wish you very warm welcome '+name +' .Sending from mailgun !'
    })
}
const sendCancelmail = (email,name) =>{
    mg.messages().send({
        from: 'arunneelamana10@gmail.com',
        to: email,
        subject: 'Leaving from company',
        text: 'Wish you good luck in your next adventure '+name +'.'
    })
}

module.exports={
    sendWelcomemail,
    sendCancelmail
}
