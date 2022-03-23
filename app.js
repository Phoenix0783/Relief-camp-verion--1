if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
require('dotenv').config()  

const express = require('express');
const path = require('path'); 
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash'); 
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const Campground = require('./models/campground')
const fast2sms = require('fast-two-sms')


const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const Booked = require('./models/booked');
const People = require('./models/people');
const Alert = require('./models/alert');

// const dbUrl = process.env.DB_URL;


const MongoDBStore = require("connect-mongo")(session);

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/elp-camp'
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    console.log(req.session)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


app.get('/openNGOD', async(req,res)=>{
    const campgrounds = await Campground.find({});
    res.render('ngod.ejs',{campgrounds})
})

app.get('/active_camps', async(req,res)=>{
    const campgrounds = await Campground.find({});
    res.render('active_camps.ejs',{campgrounds})
})

app.get('/requirements', async(req,res)=>{
    const campgrounds = await Campground.find({});
    res.render('list_requirements',{campgrounds})
})

app.post('/openNGOD', async(req,res)=>{
    const campgrounds = await Campground.find({});
    if(req.body.username == "admin" && req.body.password == "admin"){
        res.render("ngod.ejs",{campgrounds})
    }
})




// Alerts

app.get('/alert', (req, res) => {
    
    res.render('alert_form')
});
app.post('/sendAlert', async (req, res) => {
    // var options = {authorization : process.env.API_KEY , message : 'Please stay calm, our team will be coming to your rescue soon. it is adviced to keep your Phone active our team will be contacting you as soon as they arrive on the scene for your rescue scene 🤝🤝🤝',  numbers : [req.body.number]} 

    // var options = {authorization : process.env.API_KEY , message : `Your alert under name ${req.body.name},${req.body.location},Time:${req.body.time},Date:${req.body.date} 🤝🤝🤝`,  numbers : [req.body.number]} 

    // const response =await fast2sms.sendMessage(options) //Asynchronous Function.

    const alert = new Alert(req.body.alert);
    await alert.save();
        res.redirect('/campgrounds')
});

app.get('/alert_people',async (req, res) => {
    const alerts = await Alert.find({});
    res.render('alert_people.ejs',{alerts})
});

 


// Book camp

app.get('/bookCamp',async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('book_camp_form.ejs',{campgrounds})
});

app.post('/sendbookCamp',async (req, res) => {
    // var option1 = {authorization : process.env.API_KEY , message : `Mr./Mrs. ${req.body.name} , Camp named with ID of ${req.body.cname} has been booked on the number registered on ${req.body.number}.`,  numbers : [req.body.number]} 
    //  var option2 = {authorization : process.env.API_KEY , message : `Please keep this message secure. It will be needed to verify your identiy when you arrive at the campsite.Have a safe journey on the way to the camp`,  numbers : [req.body.number]} 
    // const response1 =await fast2sms.sendMessage(option1) //Asynchronous Function.
    // const response2 =await fast2sms.sendMessage(option2) //Asynchronous Function.
    res.redirect('/campgrounds')

    const booked = new Booked(req.body.booked);
    await booked.save();

});

app.get('/booked_this_camp',async (req, res) => {
    const books = await Booked.find({});
    res.render('booked_this_camp.ejs',{books})
});




// add person form

app.get('/add_person_form',async (req, res) => {
    res.render('add_person.ejs')
});

// add person to database
app.post('/add_person',async (req, res) => {
    const people = new People(req.body.people);
    await people.save();
    res.redirect('/campgrounds');
});


app.get('/peoples',async (req, res) => {
    const peoples = await People.find({});
    res.render('list_peoples.ejs',{peoples})
});





// DRO routes

app.get('/DRO_form',async (req, res) => {
    res.render('org_register.ejs')
});

app.post('/sendDRO',async (req, res) => {
    var options = {authorization : process.env.API_KEY , message : `Your organization has been registered under name of ${req.body.orgName}, your credentials under the username = admin and password = admin`,  numbers : [req.body.number]} 
    const response =await fast2sms.sendMessage(options) //Asynchronous Function.
        res.redirect('/campgrounds')
});


// Directions

app.get('/directions', (req, res) => {
    res.render('direction.ejs')
});
    



// show demo routes

app.get('/demo', (req, res) => {

    res.render('ngod1.ejs',)
});

app.get('/showdemo', (req, res) => {
    res.render('showdemo.ejs')
});

app.get('/bookecampdemo', (req, res) => {
    res.render('bookedcampdemo.ejs')
});

app.get('/currentcampdemo', (req, res) => {
    res.render('currentcampdemo.ejs')
});




app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)


app.get('/', (req, res) => {
    res.render('home')
});


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})


const port  =process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})


