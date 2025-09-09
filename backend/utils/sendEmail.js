import nodemailer from 'nodemailer';

export default async function sendEmail({ email, subject, message }) {
  // Create a test account
  const testAccount = await nodemailer.createTestAccount();

  // Create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  // Send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"LabRooms" <noreply@labrooms.com>',
    to: email,
    subject: subject,
    text: message,
    html: `<p>${message}</p>`,
  });

  console.log('Message sent: %s', info.messageId);
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  
  return info;
}
