//const User = require("../models/UserModel");
const mysql = require("pg");

const crypto = require("crypto");
const sendEmail = require("../utils/email")


const login = (req, res) => {
    //console.log(res.locals.userLogin);
    if (res.locals.userLogin) {
        return res.redirect('index');
    }
    return res.render('login');
}

// check login credential
const validate = async (req, res) => {

    var userName = req.body.username;
    var userPassword = crypto.createHash('md5').update(req.body.password).digest("hex");
    
   

    var pool = require('../controller/database');    

    const client = await pool.connect()

    const query = {
        text : 'select users.id_users, users.user_name, users.user_password, users.role_id, users.user_image, users.employee_id, users.player_id, user_roles.id_user_roles, user_roles.role_name from users '
        +' join user_roles on user_roles.id_user_roles = users.role_id '
        +' where user_name=$1 and user_password=$2',
        values: [userName, userPassword],
        rowMode: 'array'
    }

    await client.query(query, (err, userdata) => {
        console.log(userdata);
        if(err){
            console.log(err);
            return res.redirect('/login');
        }else{
            if(userdata.rowCount > 0){
                const usersession = req.session;
                usersession.userrole = userdata.rows[0][8];
                usersession.username = userdata.rows[0][1];
                usersession.userid = userdata.rows[0][0];
                usersession.userimage = userdata.rows[0][4];

                return res.redirect('/');
            }else{
                console.log("user not found");
                req.flash("error", "Invalid Email or Password.");
                return res.redirect('/login');
            
            }
        }
    })
    
    client.release()

}

// registration
const signup = async (req, res) => {
    var username = req.body.username;
    var userEmail = req.body.email;
    var userpassword = crypto.createHash('md5').update(req.body.password).digest("hex");

    var pool = require('../controller/database');    

    // check user exists or not
    const query = {
        text : "select users.*, user_roles.id_user_roles, user_roles.role_name from users "
        +" join user_roles on user_roles.id_user_roles = users.id_users "
        +" where user_name=$1",
        values: [username],
        rowMode: 'array'
    }
    const client = await pool.connect()

    await client.query(query, (err, existsUser) => {
        console.log(existsUser);
        if(err){
            console.log(err);
            return res.redirect('/register');
        }else{
            if(existsUser.rowCount>0){
                req.flash("error", "Account already register.");
                return res.redirect('/login');
            }
        }

    })

    var formdata = {
        name: username,
        email: userEmail,
        password: userpassword
    };

    const insertquery = {
        text: "insert into users (user_name, user_password, role_id) values($1,$2,$3)",
        values:[username, userpassword, 2]        
    }
    await client.query(insertquery, (err, insertID) => {
        console.log(insertID);
        if(err){
            console.log(err);
            req.flash("error", err);
            return res.redirect('/register');
        }else{
            if(insertID < 0){
                req.flash("error", "Not Registered.");
                return res.redirect('/register');
            }else{
                req.flash("message", "Registration successfull.");
                return res.redirect("/login");
            }
        }

    })
}

const logout = (req, res) => {

    req.session.destroy();
    res.redirect('/login')
}

// forgot password send link
const forgotpassword = async (req, res) => {

    const userEmail = req.body.email;
    // console.log(userEmail);

    const user = await User.findOne({ email: userEmail });

    if (!user) {
        console.log("user not exists");
        req.flash("error", "Please provide valid email id.")
        return res.redirect('/forgotpassword')
    }

    console.log("email user", user.email);
    // Generate the random token
    var resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${req.protocol}://${req.get('host')}/resetpassword?token=${resetToken}`;
    console.log("resetPasswordUrl", resetPasswordUrl)

    const message = 'Reset your password with given link: <a href="' + resetPasswordUrl + '">' + resetPasswordUrl + "</a>";
    try {
        var subject = process.env.EMAIL_FORGET_PSWD_SUBJECT
        await sendEmail({
            email: user.email,
            subject: subject,
            message
        });
        req.flash("message", "Password reset link send on email id.")
    } catch (err) {
        console.log(err);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        req.flash("error", err.message)
    }

    return res.redirect('/forgotpassword')
}

// check token is valid or not
const resetpswdview = async (req, res) => {
    var token = req.query.token;

    // decode string
    let bufferObj = Buffer.from(token, "base64");
    token = bufferObj.toString("utf8");
    console.log("base64 decode string", token);
    let decodeStr = token.split("|");
    // console.log("After split", decodeStr[0], decodeStr[1]);

    const user = await User.findOne({ _id: decodeStr[1], passwordResetToken: decodeStr[0], passwordResetExpires: { $gt: Date.now() } });

    if (!user) {
        return res.redirect("/error");
    }
    return res.render("auth/resetpassword", { token: user._id, title: 'Change Password', layout: 'layout/layout-without-nav' });
}

// Change password
const changepassword = async (req, res) => {

    const userId = req.body.token;
    const password = req.body.password;
    // console.log(userId, password);

    const user = await User.findOne({ _id: userId });
    if (!user) {
        return res.redirect("/error");
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.save();
    req.flash("message", "Password reset successfully.");
    return res.redirect("/login");

}
module.exports = { login, validate, logout, signup, forgotpassword, resetpswdview, changepassword }