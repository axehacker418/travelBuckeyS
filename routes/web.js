// Router function calling to to use in routing the apis 
const express=require('express')
const UserController = require('../Controllers/UserController')
const TripController = require('../Controllers/TripController')
const checkAuth = require('../Middelwere/auth')
const ProfileController = require('../Controllers/ProfileController')
const ChatController = require('../Controllers/Chatcontroller')
const LocationController = require('../Controllers/LocationController')
const router=express.Router()


// router.get('/', (req, res) => {
//     res.send('Web is working but Bro/Sis you are on the wrong URL'); // sends "Hello" to the browser
// });
router.post("/register",UserController.register)
router.post('/login',UserController.Login)
// Optional: profile route
// router.get('/profile', UserController.profile);

// router.get('/register', (req, res) => {
//   res.send("Register route is working (use POST for actual registration).");
// });
// Logout
router.get('/logout', UserController.logout);


//Travel links 
router.post('/trip/:id',checkAuth, TripController.addtrip)
router.get('/gettrip',checkAuth,TripController.getTrip)

router.put('/trip/start/:id', checkAuth, TripController.startTrip);
router.put('/trip/cancel/:id', checkAuth, TripController.cancelTrip);
router.delete("/trip/delete/:id", checkAuth, TripController.deleteTrip);
router.put("/trip/complete/:id", checkAuth, TripController.completeTrip);



//profile
router.get("/profile/me", checkAuth, ProfileController.getMyProfile);
router.put("/profile/image", checkAuth, ProfileController.updateProfileImage);


router.post("/Chatbot", checkAuth, ChatController.chat);

router.post("/profile/change/:id", checkAuth,UserController.changePassword)
router.get("/location/suggestions", LocationController.suggest);


router.post("/forgot-password", UserController.forgotPassword);

router.post("/reset-password", UserController.resetPassword);

//now time to export the router function to use in app.js
module.exports=router
