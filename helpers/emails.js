import nodemailer from "nodemailer";
//! ALTERNATIVE CODE

export const emailRegister = async (data) => {
  const { email, name, token } = data;

  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // EMAIL INFORMATION
  const info = await transport.sendMail({
    from: '"UpTask - Project Manager" <cuentas@uptask.com>',
    to: email,
    subject: "Uptask - Confirm your Account",
    text: "Confirm your account",
    html: `
    <p>Hi: ${name}, Confirm your account in UpTask</p>
    <p>Your account is almost ready, just confirm clicking this link :
        <a href="${process.env.FRONTEND_URL}/confirm/${token}">Confirm Account</a>
    </p>
    <p>If you didnt create this account, ignore this email</p>
    
    `,
  });
};

export const emailForgotPassword = async (data) => {
  const { email, name, token } = data;

  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // EMAIL INFORMATION
  const info = await transport.sendMail({
    from: '"UpTask - Project Manager" <cuentas@uptask.com>',
    to: email,
    subject: "Uptask - Reset your Account",
    text: "Resetyour account",
    html: `
    <p>Hi: ${name}, You have requested to reset your password</p>
    <p>Follow this link to reset your password :
        <a href="${process.env.FRONTEND_URL}/forgot-password/${token}">Reset password</a>
    </p>
    <p>If you didnt this request, ignore this email</p>
    
    `,
  });
};
