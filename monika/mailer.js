/*!
  Author: Yukashimi
  Date: 03/05/2018
  File: mailer.js
  https://nodemailer.com/about/
*/
'use strict';

const nodemailer = require('nodemailer');
const date = require('./dates.js');
//const config = require('./config.js');

const config = {
  mail: {
    /*
    The our_mail is who will recieve the email, the from_mail, however,
    isn't the sender, many email providers blocks "custom made" senders
    such as created on the fly by code to "stop spam". Due to this we
    have to always use the same email, use replyTo instead of from
    */
    our_mail: "chatbot@intech.com.br",
    from_mail: "chatbot@intech.com.br",
    service: "Hotmail"
  }
};

function getBody(user_info, index, complement){
  let txt = [
    ("Enquanto eu realizava o atendimento d" + user_info.article + " " + user_info.name +
        " no dia " + date.emailDate() + " eu não consegui responder algumas perguntas. Eu anexei os logs da conversa neste e-mail para você me ajudar.\nA última pergunta foi: \""
        + complement + "\".\nAss: Assistente Virtual Bia."),
	  ("A sugestão d@ " + user_info + " foi: \"" + complement + "\". Como iremos prosseguir?"),
    (user_info.article + " " + user_info.name + " não gostou da Bia...\nLogs anexados neste e-mail.")
  ];
  let html = [
    ("<p>Enquanto eu realizava o atendimento d" + user_info.article + " <b>" + user_info.name +
        "</b> no dia " + date.emailDate() + " eu não consegui responder algumas perguntas. Eu anexei os logs da conversa neste e-mail para você me ajudar.</p><p>A última pergunta foi: \"<b>"
        + complement + "</b>\".Ass: Assistente Virtual Bia.</p>"),
	  ("<p>A sugestão d@ <b>" + user_info + "</b> foi: \"<b>" + complement + "</b>\". Como iremos prosseguir?</p>"),
    ("<p><b>" + user_info.article + " " + user_info.name + "</b> não gostou da Bia...<br>Logs anexados neste e-mail.</p>")
  ];
  return [txt[index], html[index]];
}

function getSubject(user_info, index){
  let subjects = [
    ("Eu não consegui entender " + user_info.article + " " + user_info.name + "! Me ajude!"),
	  (user_info + " tem uma nova sugestão!"),
    ("Feedback negativo! :( ")
  ];
  return subjects[index];
}

function mailer(user, email, sub, body, files){
  /*
    This is where you set the service info
    For example, you can use gmail or hotmail
    To send the email
  */
  let smtpConfig = {
    host: '177.11.82.207', //Intech webmail
    port: 25, //Tecnically this should be 587, but...
    auth: {
      user: process.env.MAILER_USER,
      pass: process.env.MAILER_PASS
    }
  };
  
  let transporter = nodemailer.createTransport(smtpConfig);

  /* The actual info goes here, like email body */
  let mailOptions = {
    from: config.mail.from_mail,
	replyTo: email,
    to: config.mail.our_mail,
    subject: sub,
    text: body[0], // plain text body
    html: body[1], // html body
      attachments: files,
    /*dsn: {
      id: 'some random message specific id',
      return: 'headers',
      notify: 'success',
      recipient: ''
    }*/
    };

  /* Actual sending goes here */
  transporter.sendMail(mailOptions, (error, info) => {
    if(error){
      return console.log("Lazy error handling is lazy: " + error);
    }
    console.log('Message sent! The message id is: %s', info.messageId);
    res.setHeader("Content-Type", "application/json");
	  return res.status(200).json({
      message: 'Emailed successfully sent', details: info });;
  });
}

module.exports = {
  getBody: getBody,
  getSubject: getSubject,
  mailer: mailer
}
