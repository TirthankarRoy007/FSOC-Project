const ticketModel = require('../models/ticketModel')
const projectModel = require('../models/projectModel')
const UserModel = require('../models/userModel')
const mongoose = require('mongoose')

// Create a new ticket
exports.createTicket = async (req, res) => {
  const projectId = req.params.projectId;
  const { title, description, status, assignee, comments } = req.body;

  try {
    // Check if project exists
    const project = await projectModel.findById(projectId);
    if (!project) {
      return res.status(404).send({ status: false, message: 'Project not found' });
    }

    // Validate title and description
    if (!title || !description) {
      return res.status(400).send({ status: false, message: 'Title and description are required' });
    }

    // Validate status and assignee
    if (status && !['TODO', 'INPROGRESS', 'DONE'].includes(status)) {
      return res.status(400).send({ status: false, message: 'Invalid status' });
    }

    // Create new ticket
    const ticket = {
      title,
      description,
      createdBy: project.admin,
      project: project._id,
      status: status || 'TODO',
      assignee: assignee || project.admin,
      comments: []
    };
    // Add comment if provided by a member or admin of the project
    const user = req.loginUserId;
    if (comments && (project.members.includes(user) || project.admin === user)) {
      ticket.comments.push({ text: comments, createdBy: user });
    }

    const createTicket = await ticketModel.create(ticket);

    // Add the ticket to the project's tickets array
    project.tickets.push(createTicket._id);
    await project.save();

    res.status(200).send({ message: 'Ticket created successfully', createTicket });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error });
  }
};

exports.getTickets = async (req, res) => {
  const { projectId } = req.params;

  try {
    // Check if project exists
    const project = await projectModel.findById(projectId);
    if (!project) {
      return res.status(404).send({ message: 'Project not found' });
    }

    // Check if user is an admin or member of the project
    const user = req.loginUserId;
    const id = project.admin.toString()

    if (id !== user && !project.members.includes(user)) {
      return res.status(403).send({ message: 'You are not authorized to view tickets in this project' });
    }

    // Get all tickets in the project that are not deleted
    const tickets = await ticketModel.find({ project: projectId, isDeleted: false }).populate('assignee', 'name');

    res.status(200).send({ tickets });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error })
  }
};

//Get Ticket by Id
exports.getTicketById = async (req, res) => {
  try {
    const ticketId = req.params.ticketId
    const { projectId } = req.params;
    const ticket = await ticketModel.findOne({ _id: ticketId, isDeleted: false }).populate('assignee', 'comments.author');
    if (!ticket) {
      return res.status(404).send({ message: 'Ticket not found' });
    }

    // Check if user is an admin or member of the project
    const user1 = req.loginUserId;
    // console.log(user)
    const project = await projectModel.findById(projectId);
    const id1 = project.admin.toString()
    // console.log(id)
    if (id1 !== user1 && !project.members.includes(user)) {
      return res.status(403).send({ message: 'You are not authorized to view this ticket' });
    }

    res.send(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
};


//Update Ticket, Change Status & Assign Ticket
exports.updateTicket = async (req, res) => {
  const { title, description, status, assignee, comments } = req.body;
  const { ticketId } = req.params;
  const { projectId } = req.params

  try {
    // Check if user is an admin of the project associated with the ticket
    const ticket = await ticketModel.findById(ticketId);
    const project = await projectModel.findById(projectId);
    // console.log(project)
    const id = project.admin.toString()
    // console.log(id)
    // console.log(req.loginUserId)
    if (!id === req.loginUserId && !project.members.includes(user)) {
      return res.status(403).send({ message: 'Only admins can update tickets' });
    }

    // Validate title and description
    if (title && title.trim() !== '') {
      ticket.title = title;
    }
    if (description && description.trim() !== '') {
      ticket.description = description;
    }

    // Validate status and assignee
    if (status && ['TODO', 'INPROGRESS', 'DONE'].includes(status)) {
      ticket.status = status;
    }
    if (assignee) {
      const user = await UserModel.findById(assignee);
      if (user) {
        ticket.assignee = user._id;
      } else {
        return res.status(400).send({ message: 'Invalid assignee ID' });
      }
    }

    // Validate comments
    if (comments && comments.length > 0) {
      comments.forEach((comment) => {
        if (!comment) {
          return res.status(400).send({ message: 'Comment text is required' });
        }
        if (comment.author && !mongoose.isValidObjectId(comment.author)) {
          return res.status(400).send({ message: 'Invalid comment author ID' });
        }
      });
      ticket.comments = ticket.comments.concat(comments);
    }

    await ticket.save();
    res.send({ message: 'Ticket updated successfully', ticket });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
  }
};

//Delete Tickets
exports.deleteTicket = async (req, res) => {
  const { ticketId } = req.params;
  const { projectId } = req.params;

  try {
    // Check if user is an admin of the project associated with the ticket
    const ticket = await ticketModel.findById(ticketId);
    const project = await projectModel.findById(projectId);
    const adminId = project.admin.toString();
    const userId = req.loginUserId;
    if (adminId !== userId && !project.members.includes(userId)) {
      return res.status(403).send({ message: 'Only admins can delete tickets' });
    }

    // Soft delete the ticket
    ticket.isDeleted = true;
    ticket.deletedAt = new Date();
    await ticket.save();

    res.send({ message: 'Ticket deleted successfully'});
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};
//Add Comment
exports.addComments = async (req, res) => {
  try {
    const ticketId = req.params.ticketId;
    const { projectId } = req.params;
    const ticket = await ticketModel.findById(ticketId);

    const proj = await projectModel.findById(projectId);

    if (!ticket) {
      return res.status(404).send({ error: "Ticket not found" });
    }

    // Only admin of that project, assignee of the ticket or member can add comments
    const assigneeId = ticket.assignee.toString();
    const isAdmin = proj.admin.toString()
    const isAssignee = assigneeId
    const isMember = proj.members.includes(req.loginUserId);

    if (!isAdmin && !isAssignee && !isMember) {
      return res.status(401).send({ error: "Unauthorized access" });
    }

    const content = req.body.content;
    if (!content || content.trim() === "") {
      return res.status(400).send({ error: "Comment content is required" });
    }

    ticket.comments.unshift({
      author: req.loginUserId,
      content: content,
    });
    await ticket.save();
    res.send(ticket);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err);
  }
};