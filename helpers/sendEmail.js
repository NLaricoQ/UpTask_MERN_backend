import nodemailer from "nodemailer";

const sendEmail = (options) =>
  new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_EMAIL,
        pass: process.env.EMAIL_PASSWORD1,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL_EMAIL,
      ...options,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      //console.log(error, info);
      if (error) {
        // console.log(error);
        return reject({ message: "An error has occured" });
      }
      return resolve({ message: "Email sent successfully" });
    });
  });

export default sendEmail;
