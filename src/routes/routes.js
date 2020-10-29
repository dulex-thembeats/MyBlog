// var passport = require('passport');
var posts = require('../Models/posts');


module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE (with all blog routes) ========
    // =====================================
    app.get('/', async (req, res) => {
        const post = await posts.find({})
        res.render('index', {  // load the index.ejs file
            post
        })
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('login', { message: req.flash('loginMessage') }); 
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('register', { message: req.flash('Success!!!') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/login', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('create', {
            user : req.user // get the user out of session and pass to template
        });
    });

    // const multer  = require('multer')
    // const sharp = require('sharp')

// const functions = require('firebase-functions');
// const config = functions.config()

const multer = require("multer");
const cloudinary = require("cloudinary");
// const { CloudinaryStorage } = require('multer-storage-cloudinary');
// require('dotenv').config()
cloudinary.config({
       cloud_name: process.env.CLOUD_NAME,
       api_key: process.env.API_KEY,
       api_secret: process.env.API_SECRET
    // cloud_name: 'lexlab',
    // api_key: '639874487847187',
    // api_secret: 'Spog1wF0f2Of9_vZIbUoadxLmmk'
});

// const storage = new CloudinaryStorage({
//             cloudinary: cloudinary,
//             folder: "demo",
//             allowedFormats: ["jpg", "png"],
//             transformation: [{ width: 500, height: 500, crop: "limit" }]
// });

const upload = multer({ 
        dest: 'avatar/',
        limits: {
            fileSize: 3000000
     },
        fileFilter(req, file, cb){
            if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
                return cb(new Error('Please upload an image file'))
            }
            cb(undefined, true)
        }
    })
    
app.post('/profile', isLoggedIn, upload.single('avatar'), async(req, res) => {
    const File = req.file.path
    cloudinary.uploader.upload(File, async(result) => {
    const post = new posts({
    ...req.body,
    image: result.url,
    image_id: result.public_id
})
    try {
        await post.save()
        res.redirect('/');
    } catch (e) {   
        res.status(400).send("Error", e);
    }
        // console.log(result.url);
    })

}); 

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    // =====================================
    // HOME PAGE ROUTES (The second to the last(/:id) route is a problematic route, so be very careful where you place it) ========
    // =====================================
    app.get('/contact', (req, res) => {
        res.render('contact');
    })

    app.post('/contact', (req, res) => {
        const Message = req.body

        const sgMail = require('@sendgrid/mail');
        const sendgridAPIKey = process.env.SENDGRID_API_KEY;
        sgMail.setApiKey(sendgridAPIKey);

        const msg = {
            to: 'dulex552@gmail.com',
            from: 'dulex51@hotmail.com',
            subject: `Messages from My Blog: Senders phone ${Message.phone}`,
            text: Message.message
      // html: '<strong>Message from dulex_thembeats.</strong>'
    }; 

        sgMail.send(msg).then(() => {
            console.log('message sent', msg);
            res.render('contact', {
                message: msg
            });

        }, error => {
            console.error(error);
        
            if (error.response) {
            console.error(error.response.body)
            }
        });
        
})
   
    app.get('/about', (req, res) => {
        res.render('about');
    })

    // app.get('/*', (req, res) => {
    //     res.render('404', {
    //         title: '404',
    //         errorMessage: 'Page Not Found'
    //     })
    // }) 

    app.get('/:id', async (req, res) => {
        const post = await posts.findById(req.params.id)
        res.render('post', {
            post
        })
    });   
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

