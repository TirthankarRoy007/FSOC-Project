const express = require('express');
const router = express.Router();

const {loginUser,userSignUp,forgotPassword, resetPassword, getUsers, myDetail,logoutUser} = require("../controller/authController")
const {createProject, getAllProjects, getProjectById, updateProject, deleteProject, addMember, removeMember} = require('../controller/projectController')
const auth = require('../middleware/middleware.js');
const { createTicket, getTickets, getTicketById, updateTicket, deleteTicket, addComments } = require('../controller/ticketController');


//Auth-Controller
router.post("/register", userSignUp)
router.post("/login", loginUser)
router.post("/forgot", forgotPassword)
router.post("/reset", resetPassword)
router.get('/users', getUsers)
router.get('/me',auth.authentication, myDetail)
router.post('/logout', logoutUser);


//Project Controller
router.post("/createProject", auth.authentication, createProject)
router.get("/getProject", getAllProjects)
router.get("/getProject/:projectId", getProjectById)
router.put("/updateProject/:projectId", auth.authentication, updateProject)
router.delete("/deleteProject/:projectId", auth.authentication, deleteProject)
router.post("/addMembers/:projectId", auth.authentication, addMember)
router.delete("/removeMembers/:projectId", auth.authentication, removeMember)

//Ticket Controller
router.post("/createTicket/:projectId", createTicket)
router.get("/getTickets/:projectId", auth.authentication, getTickets)
router.get("/getTicketsById/:ticketId/:projectId", auth.authentication, getTicketById)
router.put("/updateTicket/:ticketId/:projectId", auth.authentication, updateTicket)
router.delete('/deleteTicket/:projectId/tickets/:ticketId', auth.authentication, deleteTicket);
router.post("/addComments/:ticketId/:projectId", auth.authentication, addComments)

router.all("/*", (req, res) => {
    res.status(400).send({ status: false, message: "This page does not exist, please check your url" })
})

// router.get('/healthCheck', function (req, res) {
//     res.send('App is running successfully')
// });



module.exports = router