//import { emailRegister, emailForgotPassword } from "../helpers/emails.js";
import generateId from "../helpers/generateId.js";
import generateJWT from "../helpers/generateJWT.js";
import sendEmail from "../helpers/sendEmail.js";
import User from "../models/User.js";

//* REGISTER USER
const register = async (req, res) => {
  // Avoid duplicated users
  const { email } = req.body;
  const alreadyUser = await User.findOne({ email });
  if (alreadyUser) {
    const error = new Error("User already registered");
    return res.status(400).json({ msg: error.message });
  }
  //! ALTERNATIVE
  // try {
  //   const user = new User(req.body);
  //   user.token = generateId();
  //   await user.save();
  //   // Send Confirmation EMAIL
  //   emailRegister({ email: user.email, name: user.name, token: user.token });
  //   res.json({ msg: "User Created Successfully, Check your email" });
  // } catch (error) {
  //   console.log(error);
  // }

  try {
    const user = new User(req.body);
    user.token = generateId();
    await user.save();
    const link = `${process.env.FRONTEND_URL}/confirm/${user.token}`;
    await sendEmail({
      to: `${user.email}`,
      subject: "Verify email for UpTask",
      html: `
              <div>
                  <h1>Hello ${user.name}</h1>
                  <p>Verify your account clicking this link</p>
                  <a href="${link}">Confirm Account</a>
                  <p>Thanks for sign up in UpTask</p>
                  <p>If you didnt create this account, ignore this email</p>
              </div>
           `,
    });
    res.json({
      msg: "User Created Successfully, Check your email and virify your account",
    });
  } catch (error) {
    console.log(error);
  }
};
//* AUTH USER
const auth = async (req, res) => {
  const { email, password } = req.body;
  // Validate is user exists
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error("User does not exist");
    return res.status(404).json({ msg: error.message });
  }

  // Validate if user is already confirmed

  if (!user.confirmed) {
    const error = new Error("Your account is not confirmed yet");
    return res.status(403).json({ msg: error.message });
  }

  // Check password
  if (await user.checkPassword(password)) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateJWT(user._id),
    });
  } else {
    const error = new Error("Incorrect password");
    return res.status(403).json({ msg: error.message });
  }
};

//* Confirm User with token
const confirm = async (req, res) => {
  const { token } = req.params;
  const userConfirmed = await User.findOne({ token });
  if (!userConfirmed) {
    const error = new Error("Invalid Token");
    return res.status(403).json({ msg: error.message });
  }
  try {
    userConfirmed.confirmed = true;
    userConfirmed.token = "";
    await userConfirmed.save();
    res.json({ msg: "User Confirmed Successfully" });
    console.log(userConfirmed);
  } catch (error) {
    console.log(error);
  }
};

//* Forgot Password AND GENERATE TOKEN
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error("User does not exist");
    res.status(404).json({ msg: error.message });
  }
  try {
    user.token = generateId();
    await user.save();
    //! ALTERNATIVE
    //Send Email
    // emailForgotPassword({
    //   email: user.email,
    //   name: user.name,
    //   token: user.token,
    // });
    const link = `${process.env.FRONTEND_URL}/forgot-password/${user.token}`;
    await sendEmail({
      to: `${user.email}`,
      subject: "Uptask - Reset your Password",
      html: `
              <div>
                  <h1>Hello ${user.name}</h1>
                  <p>You have requested to reset your password</p>
                  <p>Follow this link to reset your password :
                  
                  </p>    
                  <a href="${link}">Reset Password</a>                               
                  <p>If you didnt this request, ignore this email</p>
              </div>
           `,
    });
    res.json({ msg: "We just sent you an email with instructions" });
  } catch (error) {
    console.log(error);
  }
};

//* Check Token to change password
const checkToken = async (req, res) => {
  const { token } = req.params;

  const validToken = await User.findOne({ token });
  if (validToken) {
    res.json({ msg: "Valid Token and user exist" });
  } else {
    const error = new Error("Invalid Token");
    return res.status(404).json({ msg: error.message });
  }
};

//* Change new password
const newPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({ token });
  if (user) {
    user.password = password;
    user.token = "";
    try {
      await user.save();
      res.json({ msg: "Password changed successfully" });
    } catch (error) {
      console.log(error);
    }
  }
};

const profile = async (req, res) => {
  const { user } = req;

  res.json(user);
};
export {
  register,
  auth,
  confirm,
  forgotPassword,
  checkToken,
  newPassword,
  profile,
};
