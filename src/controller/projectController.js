const projectModel = require('../models/projectModel')
const UserModel = require('../models/userModel')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
// Create a new project
exports.createProject = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name === " ") {
      return res
        .status(400)
        .send({ status: false, message: "Project Name is Required" });
    }

   // create a new project with the provided name and assign the current user as the admin
    const project = {
      name: name,
      admin: req.loginUserId,
      members: [
        {
          _id: req.loginUserId,
          isAdmin: true,
          isMember: true,
        },
      ],
    };

    // save the project to the database
    const savedProject = await projectModel.create(project);
    const userToken = jwt.sign({ userId: req.loginUserId }, process.env.SECUKEY, { expiresIn: 30000 });
    res.cookie('token', userToken).status(201).send({ status: true, data: savedProject});
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
};


//Get all projects for the authenticated user
exports.getAllProjects = async (req, res) => {
  try {
    const { userId } = req.params;

    const projects = await projectModel.find({
      $and: [
        {
          $or: [
            { admin: { $eq: userId } },
            { users: { $elemMatch: { $eq: userId } } }
          ]
        },
        { isDeleted: false }
      ]
    })
    .populate('tickets')
    .populate('name', 'email')
    .exec();

    res.status(200).send(projects);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Something went wrong' });
  }
};

// Get a project by ID
exports.getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { loginUserId } = req;
    
    const project = await projectModel.findOne({ 
      _id: projectId, 
      $and: [
        { $or: [{ admin: loginUserId }, { users: loginUserId }] },
        { isDeleted: false }
      ]
    }).populate('name', 'email');
    
    if (!project) {
      return res.status(404).send({ status: false, message: 'Project not found' });
    }
    
    res.status(200).send({ status: true, data: project });
  } catch (err) {
    console.error(err);
    res.status(500).send({ status: false, message: 'Something went wrong' });
  }
};

// Update a project by ID
exports.updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name } = req.body;
    const userId = req.loginUserId;

    if (!name) {
      return res.status(400).send({ status: false, message: 'Project name is mandatory' });
    }

    const project = await projectModel.findOne({ _id: projectId, admin: userId });
    
    if (!project) {
      return res.status(404).send({ status: false, message: 'Project not found or you are not an admin' });
    }

    project.name = name;
    await project.save();

    res.status(200).send({ status: true, message: "Project Updated Successfully" });
  } catch (err) {
    res.status(500).send({ status: false, err: err.message });
  }
};


// Delete a project by ID
exports.deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.loginUserId;

    // Find the project by ID and check if the current user is the admin
    const project = await projectModel.findOne({ _id: projectId, admin: userId });

    // If the project is not found or the current user is not the admin, return 404 error
    if (!project) {
      return res.status(404).send({ status: false, message: 'Project not found or you are not authorized to delete this project' });
    }

    // Mark the project as deleted or soft delete
    project.isDeleted = true;
    await project.save();

    // Return required message
    return res.send({status:true, message: "Project Deleted Successfully"});
  } catch (err) {
    console.error(err);
    return res.status(500).send({ status: false, message: 'Internal server error' });
  }
};


// Add a member to a project
exports.addMember = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const member = req.body.memberId;
    const userId = req.loginUserId;
    // console.log(member);

    // Validate project ID
    if (!mongoose.isValidObjectId(projectId)) {
      return res.status(400).send({ status: false, message: 'Invalid project ID' });
    }

    // Find the project by ID and check if the current user is the admin
    const project = await projectModel.findOne({ _id: projectId, admin: userId });
    if (!project) {
      return res.status(404).send({ status: false, message: 'Project not found or you are not the admin' });
    }

    // Validate member
    if (!member) {
      return res.status(400).send({ status: false, message: 'Invalid member details' });
    }
    const existingMember = project.members.find(m => m.email === member.email)
    const existingId = existingMember._id.toString()

    // console.log(existingId);
    // Check if the member is already a part of the project
    if (existingId === member) {
      return res.status(400).send({ status: false, message: 'Member already exists in the project' });
    }

    // Check if the user exists in the database and update the isMember flag
    const user = await UserModel.findOneAndUpdate(
      { _id: member },
      { isMember: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).send({ status: false, message: 'User not found' });
    }

    // Add the member to the project members array
    project.members.push({ user: user._id, isMember: true });

    // Save the updated project to the database
    await project.save();

    // Return the updated project object
    return res.send({ status: true, data: project });
  } catch (err) {
    console.error(err);
    return res.status(500).send(err);
  }
};

exports.removeMember = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const member = req.body.memberId;

    // Check if project exists
    const project = await projectModel.findById(projectId);
    if (!project) {
      return res.status(404).send({ message: 'Project not found' });
    }

    // Validate project ID
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).send({ message: 'Invalid project ID' });
    }

    // Validate member ID
    if (!mongoose.Types.ObjectId.isValid(member)) {
      return res.status(400).send({ message: 'Invalid member ID' });
    }

    // Check if user making the request has admin role
    if (!req.loginUserId) {
      return res.status(403).send({ message: 'Only admins can remove members from projects' });
    }

    // Check if member exists in the project members array
    const memberIndex = project.members.indexOf(member);

    if (memberIndex === null) {
      return res.status(400).send({ message: 'Member is not a part of the project' });
    }

    // Soft delete the member by setting their isMember flag to false
    await UserModel.findByIdAndUpdate(member, { isMember: false });

    // Remove member from project members array
    project.members.splice(memberIndex, 1);
    await project.save();

    res.status(200).send({ message: 'Member removed from project successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
  }
};