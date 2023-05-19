# FSOC-Project (PROJECT MANAGEMENT TOOL)
Overview:
The aim of this project is to create a web-based project management tool that enables teams to plan, execute, and track projects efficiently. The tool will provide a centralized location for team members to collaborate and communicate, ensuring that everyone is on the same page and the project stays on track.


Features:

User Authentication and Authorization


To access any features on the platform, users must create an account and log in using their email ID and password. The platform includes three user roles:PROJECT_ADMIN, PROJECT_USER each with different levels of access which will be on per project basis. The PROJECT_ADMIN role has complete access to all platform functions in a project .

To sign up, user must provide their name, email address,company name and password. 

The platform also provides a "Forgot Password" feature for users who need to reset their login credentials.

Workflow
User can create a project and will be automatically assigned with a admin role
User who created the project can invite other team members of same company
There will be a projects dashboard where it should show all the projects a user is a part of
User can create a project with project name.
To create a ticket below fields will be required: title, description are mandatory
A ticket can be assigned to someone who are invited to group
Any user who are part of a project can comment
Only users who are part of project can see project details
Admin can edit project details like project name, delete project(soft delete), invite users and remove users, admin user can also make another user admin
There can be 3 state of a ticket TODO, INPROGRESS, DONE.
Any user can move a ticket to another state
Any user can assign the ticket to any other user who are part of the project.
User Profile
Users can update their profile info


# Schema's For Project
# Project Model
```
const projectModel = new mongoose.Schema(
    {
    name: {
        type: String,
        required: true
    },
    admin: {
        type: ObjectId,
        ref: 'User',
    },
    members: [{
        user: {
            type: ObjectId,
            ref: 'User'
        },
        isAdmin: {
            type: Boolean,
            default: false
        },
        isMember:  {
            type: Boolean,
            default: false
       },
    }],
    tickets: [{
        type: ObjectId,
        ref: 'Ticket'
    }],
    isDeleted: {
        type: Boolean,
        default: false
    },
  }, { timestamps: true });
  
  module.exports = mongoose.model('Project', projectModel)
  ```
 # Ticket Model
 ```
const ticketModel = new mongoose.Schema(
    {
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['TODO', 'INPROGRESS', 'DONE'],
        default: 'TODO'
    },
    assignee: {
        type: ObjectId,
        ref: 'User'
    },
    comments: [{
      author: {
        type: ObjectId,
        ref: 'User',
    },
      content: {
        type: String,
        required: true
    },
      createdAt: {
        type: Date, 
        default: Date.now
    },
    }],
  }, { timestamps: true });

  module.exports = mongoose.model('Ticket', ticketModel)
```
  # User Model
  ```
const userModel = new mongoose.Schema(
    {
    name: { 
        type: String,
        required: true 
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    company: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    secretQuestion: {
        question: {
            type: String,
            required: true
        },
        answer: {
            type: String,
            required: true
        }
    }
  }, { timestamps: true });

  module.exports = mongoose.model('User', userModel)
  ```

  # API Endpoints 
  # 1> User Sign Up (localhost:3000/register)
  # Request Body
  ```
  {
    "name": "Robert Downey Jr",
    "email": "rdj@gmail.com",
    "company": "Stark Industries",
    "password": "Ironman@1234",
    "secretQuestion": {
        "question": "What is your hobby?",
        "answer": "Inventing"
    }
}
```
# Response Body
```
{
    "status": true,
    "message": "Sign-Up Successful "
}
```
# 2> User Login (localhost:3000/login)
# Request Body
```
{
    "email": "rdj@gmail.com",
    "password": "Ironman@1234"
}
```
# Response Body
```
{
    "status": true,
    "message": "Success",
    "data": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NDMzZDYyNDBjMzU3MzFjOWI0OWVhOGMiLCJpYXQiOjE2ODExMTkwNDQsImV4cCI6MTY4MTE0OTA0NH0.yr4dtTRM71T6mYO84StySEwgUo6mDjIOAZnRmm9VeM0"
}
```
# 3> Forget Password(localhost:3000/forgot)
# Request Body
```
{
    "email": "rdj@gmail.com"
}
```
# Response Body
```
{
    "status": true,
    "data": {
        "email": "rdj@gmail.com",
        "secretQuestion": "What is your hobby?"
    }
}
```
# 4> Reset Password (localhost:3000/reset)
# Request Body
```
{
   "email": "rdj@gmail.com",
    "secretQuestion": "What is your hobby?",
    "answer": "Inventing",
    "newPassword": "newPass@123"
}
```
# Response Body
```
{
    "status": true,
    "message": "Password Changed Successfully"
}
```
# 5> Create Project (localhost:3000/createProject)
# Request Body
```
{
    "name": "Book Management Project"
}
```
# Response Body
```
{
    "status": true,
    "data": {
        "name": "Book Management Project",
        "admin": "6433d6240c35731c9b49ea8c",
        "members": [
            {
                "isAdmin": true,
                "isMember": true,
                "_id": "6433d6240c35731c9b49ea8c"
            }
        ],
        "tickets": [],
        "isDeleted": false,
        "_id": "6433d91c0c35731c9b49ea94",
        "createdAt": "2023-04-10T09:38:36.121Z",
        "updatedAt": "2023-04-10T09:38:36.121Z",
        "__v": 0
    }
}
```
# 6> Get Project (localhost:3000/getProject)
# Response Body
```
[
    {
        "_id": "6433d91c0c35731c9b49ea94",
        "name": "Book Management Project",
        "admin": "6433d6240c35731c9b49ea8c",
        "members": [
            {
                "isAdmin": true,
                "isMember": true,
                "_id": "6433d6240c35731c9b49ea8c"
            }
        ],
        "tickets": [],
        "isDeleted": false,
        "createdAt": "2023-04-10T09:38:36.121Z",
        "updatedAt": "2023-04-10T09:38:36.121Z",
        "__v": 0
    }
]
```
# 7> Get Project By Id (localhost:3000/getProject/:projectId)
# Response Body
```
{
    "status": true,
    "data": {
        "_id": "6433d91c0c35731c9b49ea94",
        "name": "Book Management Project",
        "admin": "6433d6240c35731c9b49ea8c",
        "members": [
            {
                "isAdmin": true,
                "isMember": true,
                "_id": "6433d6240c35731c9b49ea8c"
            }
        ],
        "tickets": [],
        "isDeleted": false,
        "createdAt": "2023-04-10T09:38:36.121Z",
        "updatedAt": "2023-04-10T09:38:36.121Z",
        "__v": 0
    }
}
```
# 8> Update Project (localhost:3000/updateProject/:projectId)
# Request Body
```
{
    "name": "MERN Stack Project"
}
```
# Response Body
```
{
    "status": true,
    "data": {
        "_id": "6433d91c0c35731c9b49ea94",
        "name": "MERN Stack Project",
        "admin": "6433d6240c35731c9b49ea8c",
        "members": [
            {
                "isAdmin": true,
                "isMember": true,
                "_id": "6433d6240c35731c9b49ea8c"
            }
        ],
        "tickets": [],
        "isDeleted": false,
        "createdAt": "2023-04-10T09:38:36.121Z",
        "updatedAt": "2023-04-10T09:55:25.993Z",
        "__v": 0
    }
}
```
# 9> Delete Project (localhost: 3000/deleteProject/:projectId)
# Response Body
```
{
    Project Id in params
}
```
# Response Body
```
{
    "status": true,
    "message": "Project Deleted Successfully"
}
```
# 10> Add Member to Project(localhost:3000/addMembers/:projectId)
# Request Body
```
{
    "memberId": "6433deaa640f057dc16d93d8"
}
```
# Response Body
```
{
    "status": true,
    "data": {
        "_id": "6433dd64640f057dc16d93d0",
        "name": "Tool Management Project",
        "admin": "6433d6240c35731c9b49ea8c",
        "members": [
            {
                "isAdmin": true,
                "isMember": true,
                "_id": "6433d6240c35731c9b49ea8c"
            },
            {
                "user": "6433deaa640f057dc16d93d8",
                "isAdmin": false,
                "isMember": true,
                "_id": "6433e0d62dff276e4c5d03ec"
            }
        ],
        "tickets": [],
        "isDeleted": false,
        "createdAt": "2023-04-10T09:56:52.034Z",
        "updatedAt": "2023-04-10T10:11:34.388Z",
        "__v": 3
    }
}
```
# 11> Remove Member from Project(localhost:3000/removeMembers/:projectId)
# Request Body
```
{
    "memberId": "6433deaa640f057dc16d93d8"
}
```
# Response Body
```
{
    "status": true,
    "message": "Member removed from project successfully"
}
```
# 12> Create Ticket (localhost:3000/createTicket/:projectId)
# Request Body
```
{
    "title": "MEAN project",
    "description": "Very Nice Project",
    "status": "TODO",
    "assignee": "6433deaa640f057dc16d93d8"
}
```
# Response Body
```
{
    "message": "Ticket created successfully",
    "createTicket": {
        "title": "MEAN project",
        "description": "Very Nice Project",
        "status": "TODO",
        "assignee": "6433deaa640f057dc16d93d8",
        "comments": [],
        "_id": "6433effa6b2f5aa3617dfce7",
        "createdAt": "2023-04-10T11:16:10.334Z",
        "updatedAt": "2023-04-10T11:16:10.334Z",
        "__v": 0
    }
}
```
# 13> Get Ticket (localhost:3000/getTickets/:projectId)

# Response Body
```
{
    "tickets": [
        {
            "_id": "6433effa6b2f5aa3617dfce7",
            "title": "MEAN project",
            "description": "Very Nice Project",
            "status": "TODO",
            "assignee": {
                "_id": "6433deaa640f057dc16d93d8",
                "name": "Chris Evans"
            },
            "comments": [],
            "createdAt": "2023-04-10T11:16:10.334Z",
            "updatedAt": "2023-04-10T11:16:10.334Z",
            "__v": 0
        }
    ]
}
```
# 14> Get Tickets By Id (localhost:3000/getTicketsById/:ticketId/:projectId)
# Response Body
```
{
    "_id": "6433effa6b2f5aa3617dfce7",
    "title": "MEAN project",
    "description": "Very Nice Project",
    "status": "TODO",
    "assignee": {
        "_id": "6433deaa640f057dc16d93d8"
    },
    "comments": [],
    "createdAt": "2023-04-10T11:16:10.334Z",
    "updatedAt": "2023-04-10T11:16:10.334Z",
    "__v": 0
}
```
# 15> Update Ticket(localhost:3000/updateTicket/:ticketId/:projectId)
# Request Body
```
{
    "title": "back-end project",
    "description": " nice Project",
    "status": "INPROGRESS",
    "assignee": "6433deaa640f057dc16d93d8"
}
```
# Response Body
```
{
    "message": "Ticket updated successfully",
    "ticket": {
        "_id": "6433effa6b2f5aa3617dfce7",
        "title": "back-end project",
        "description": " nice Project",
        "status": "INPROGRESS",
        "assignee": "6433deaa640f057dc16d93d8",
        "comments": [],
        "createdAt": "2023-04-10T11:16:10.334Z",
        "updatedAt": "2023-04-10T11:27:15.131Z",
        "__v": 0
    }
}
```
# 16> Delete Ticket (localhost:3000/deleteTicket/:projectId/tickets/:ticketId)
# Response Body
```
{
    "message": "Ticket deleted successfully"
}
```
# 17> Add Comments (localhost:3000/addComments/:ticketId/:projectId)
# Request Body
```
{
  "content": "Very Nice"
}
```
# Response Body
```
{
    "_id": "6433f42e4770eaa0c7fc1681",
    "title": "MERN project",
    "description": "Nice Project",
    "status": "TODO",
    "assignee": "6433deaa640f057dc16d93d8",
    "comments": [
        {
            "author": "6433d6240c35731c9b49ea8c",
            "content": "Very Nice",
            "_id": "6433f4674770eaa0c7fc1688",
            "createdAt": "2023-04-10T11:35:03.688Z"
        }
    ],
    "createdAt": "2023-04-10T11:34:06.360Z",
    "updatedAt": "2023-04-10T11:35:03.690Z",
    "__v": 1
}
```
