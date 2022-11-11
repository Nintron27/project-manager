import express, { Request, Response, text } from 'express';
import { Collection, ObjectID } from 'mongodb';
import multer from 'multer';
import path from 'path';
import { auth } from '../tools/auth';
import { dbHandler } from '../tools/db';
import Joi from 'joi';
const router = express.Router();

// Setting storage engine
const storage = multer.diskStorage({
	destination: '../client/public/uploads',
	filename: function (req: Request, file, callback) {
		callback(
			null,
			file.fieldname +
				'-' +
				new ObjectID().toHexString() +
				path.extname(file.originalname)
		);
	},
});

// Init upload function
const upload = multer({
	storage: storage,
	limits: { fileSize: 5000000 },
	fileFilter: function (req: Request, file, callback) {
		checkFileType(file, callback);
	},
}).single('ticketImg');

// Check file type
function checkFileType(
	file: Express.Multer.File,
	callback: multer.FileFilterCallback
) {
	// Allowed extentions
	const fileTypes = /jpeg|jpg|png|gif/;
	// Check extention
	const extName = fileTypes.test(
		path.extname(file.originalname).toLowerCase()
	);
	// Check the MIME type
	const mimeType = fileTypes.test(file.mimetype);

	if (extName && mimeType) {
		return callback(null, true);
	} else {
		callback(Error.prototype);
	}
}

router.post('/:projectID', auth('createTickets'), async (req: Request, res: Response) => {

	// If they are a demo user ignore request
	if (req.user.isDemoUser) {
		return res.sendStatus(200);
	}

	//Validate the request
	const { error } = Joi.object({
		project: Joi.string().required().hex().min(24).max(24),
		title: Joi.string().required(),
		type: Joi.string().required().valid('bug', 'suggestion'),
		severity: Joi.string()
			.required()
			.valid('low', 'medium', 'high', 'critical'),
		description: Joi.string().required(),
	}).validate(req.body);
	if (error) {
		return res.status(400).send(error.details[0].message);
	}

	const tickets: Collection = await dbHandler('tickets');
	const projects: Collection = await dbHandler('projects');
	const users: Collection = await dbHandler('users');

	let ticketID = new ObjectID();
	await tickets.insertOne({
		_id: ticketID,
		project: new ObjectID(req.body.project),
		title: req.body.title,
		type: req.body.type,
		severity: req.body.severity,
		status: 'open',
		createdBy: new ObjectID(req.user._id),
		dateCreated: new Date(),
		description: req.body.description,
		usersAssigned: [],
		comments: [],
		history: [],
	});

	const usersAndRolesQuery: any = await projects.findOne(
		{
			_id: new ObjectID(req.body.project),
		},
		{
			projection: { roles: 1, assignedUsers: 1 },
		}
	);

	// These two "for" loop blocks are to find out which users
	// need a notification to inform of a new ticket
	let roleIDsWithAssignTicket: string[] = [];
	for (let i = 0; i < usersAndRolesQuery.roles.length; i++) {
		for (let j = 0; j < usersAndRolesQuery.roles[i].permissions.length; j++) {
			if (usersAndRolesQuery.roles[i].permissions[j] === 'assignTicket') {
				roleIDsWithAssignTicket.push(usersAndRolesQuery.roles[i]._id);
			}
		}
	}
	let userIDsWithAssignTicket: string[] = [];
	for (let i = 0; i < usersAndRolesQuery.assignedUsers.length; i++) {
		for (let j = 0; j < roleIDsWithAssignTicket.length; j++) {
			if (
				new ObjectID(usersAndRolesQuery.assignedUsers[i].role).equals(
					new ObjectID(roleIDsWithAssignTicket[j])
				)
			) {
				userIDsWithAssignTicket.push(
					usersAndRolesQuery.assignedUsers[i]._id
				);
			}
		}
	}

	for (const userID of userIDsWithAssignTicket) {
		await users.updateOne(
			{
				_id: new ObjectID(userID),
			},
			{
				$push: {
					notifications: {
						_id: new ObjectID(),
						title: 'New Ticket',
						description: `A new ticket titled "${req.body.title}" has been submitted`,
						read: false,
						dateCreated: new Date(),
					},
				},
			}
		);
	}

	res.status(201).send(ticketID.toHexString());
});

router.post(
	'/:projectID/:ticketID/attachment',
	auth('createTickets'),
	async (req: Request, res: Response) => {

		// If they are a demo user ignore request
		if (req.user.isDemoUser) {
			return res.sendStatus(200);
		}

		upload(req, res, async (err: any) => {
			if (err) {
				res.status(400).send(err.message);
			} else if (req.file) {
				const tickets: Collection = await dbHandler('tickets');

				await tickets.updateOne(
					{
						_id: new ObjectID(req.params.ticketID),
					},
					{
						$set: { attachment: req.file.filename },
					}
				);
				res.status(201).send('Image attached to ticket');
			} else {
				res.status(400).send('Missing Image File');
			}
		});
	}
);

router.get('/project/:projectID', auth(''), async (req: Request, res: Response) => {
	const tickets: Collection = await dbHandler('tickets');
	const users: Collection = await dbHandler('users');

	let response = await tickets
		.find({
			project: new ObjectID(req.params.projectID),
		})
		.toArray();

	for (const ticket of response) {
		let query = await users.findOne(
			{
				_id: new ObjectID(ticket.createdBy),
			},
			{
				projection: { username: 1 },
			}
		);

		ticket.createdBy = query.username;
	}

	res.status(200).send(response);
});

router.get(
	'/:ticketID',
	auth(''),
	async (req: Request, res: Response) => {
		const tickets: Collection = await dbHandler('tickets');
		const users: Collection = await dbHandler('users');

		let response = await tickets.findOne({
			_id: new ObjectID(req.params.ticketID),
		});

		let query = await users.findOne(
			{
				_id: new ObjectID(response.createdBy),
			},
			{
				projection: { username: 1 },
			}
		);
		response.createdBy = query.username;

		for (const comment of response.comments) {
			let query = await users.findOne(
				{
					_id: new ObjectID(comment.createdBy),
				},
				{
					projection: { username: 1 },
				}
			);
			comment.createdBy = query.username;
		}

		for (let i = 0; i < response.usersAssigned.length; i++) {
			let query = await users.findOne(
				{
					_id: new ObjectID(response.usersAssigned[i]),
				},
				{
					projection: { username: 1 },
				}
			);
			response.usersAssigned[i] = {
				_id: response.usersAssigned[i],
				name: query.username,
			};
		}

		res.status(200).send(response);
	}
);

router.get(
	'/:projectID/eligibleusers/:ticketID',
	auth('manageTickets'),
	async (req: Request, res: Response) => {
		const tickets: Collection = await dbHandler('tickets');
		const projects: Collection = await dbHandler('projects');
		const users: Collection = await dbHandler('users');

		let ticket = await tickets.findOne({
			_id: new ObjectID(req.params.ticketID),
		});

		let project = await projects.findOne({
			_id: new Object(ticket.project),
		});

		let eligibleUsers = project.assignedUsers;

		// Filter out users already assigned
		for (const user of ticket.usersAssigned) {
			for (let i = 0; i < eligibleUsers.length; i++) {
				if (new ObjectID(eligibleUsers[i]._id).equals(new ObjectID(user))) {
					eligibleUsers.splice(i, 1);
				}
			}
		}

		// Filter out users who can't edit tickets
		for (let i = 0; i < eligibleUsers.length; i++) {
			let isEligible = false;
			for (let j = 0; j < project.roles.length; j++) {
				if (
					new ObjectID(project.roles[j]._id).equals(
						new ObjectID(eligibleUsers[i].role)
					)
				) {
					isEligible = project.roles[j].permissions.includes('editTickets')
						? true
						: false;
				}
			}
			if (!isEligible) {
				eligibleUsers.splice(i, 1);
			}
		}

		// Add name field to eligibleUsers
		for (let i = 0; i < eligibleUsers.length; i++) {
			let query = await users.findOne(
				{
					_id: new ObjectID(eligibleUsers[i]._id),
				},
				{
					projection: { username: 1 },
				}
			);
			eligibleUsers[i].name = query.username;
		}

		res.status(200).send(eligibleUsers);
	}
);

router.get(
	'/assigned/:projectID',
	auth('editTickets'),
	async (req: Request, res: Response) => {
		const tickets: Collection = await dbHandler('tickets');
		const users: Collection = await dbHandler('users');

		let response = await tickets
			.find({
				project: new ObjectID(req.params.projectID),
				usersAssigned: { $in: [new ObjectID(req.user._id)] },
			})
			.toArray();

		for (const ticket of response) {
			let query = await users.findOne(
				{
					_id: new ObjectID(ticket.createdBy),
				},
				{
					projection: { username: 1 },
				}
			);

			ticket.createdBy = query.username;
		}

		res.status(200).send(response);
	}
);

router.get(
	'/unassigned/:projectID',
	auth('manageTickets'),
	async (req: Request, res: Response) => {
		const tickets: Collection = await dbHandler('tickets');
		const users: Collection = await dbHandler('users');

		let response = await tickets
			.find({
				project: new ObjectID(req.params.projectID),
				usersAssigned: { $size: 0 },
			})
			.toArray();

		for (const ticket of response) {
			let query = await users.findOne(
				{
					_id: new ObjectID(ticket.createdBy),
				},
				{
					projection: { username: 1 },
				}
			);

			ticket.createdBy = query.username;
		}

		res.status(200).send(response);
	}
);

router.get(
	'/active/:projectID',
	auth('manageTickets'),
	async (req: Request, res: Response) => {
		const tickets: Collection = await dbHandler('tickets');
		const users: Collection = await dbHandler('users');

		let response = await tickets
			.find({
				project: new ObjectID(req.params.projectID),
				status: { $ne: 'closed' },
			})
			.toArray();

		for (const ticket of response) {
			let query = await users.findOne(
				{
					_id: new ObjectID(ticket.createdBy),
				},
				{
					projection: { username: 1 },
				}
			);

			ticket.createdBy = query.username;
		}

		res.status(200).send(response);
	}
);

router.get(
	'/closed/:projectID',
	auth('manageTickets'),
	async (req: Request, res: Response) => {
		const tickets: Collection = await dbHandler('tickets');
		const users: Collection = await dbHandler('users');

		let response = await tickets
			.find({
				project: new ObjectID(req.params.projectID),
				status: { $eq: 'closed' },
			})
			.toArray();

		for (const ticket of response) {
			let query = await users.findOne(
				{
					_id: new ObjectID(ticket.createdBy),
				},
				{
					projection: { username: 1 },
				}
			);

			ticket.createdBy = query.username;
		}

		res.status(200).send(response);
	}
);

router.post(
	'/:projectID/:ticketID/user/:userID',
	auth('manageTickets'),
	async (req: Request, res: Response) => {

		// If they are a demo user ignore request
		if (req.user.isDemoUser) {
			return res.sendStatus(200);
		}

		const tickets: Collection = await dbHandler('tickets');
		const users: Collection = await dbHandler('users');

		const ticket: any = await tickets.findOneAndUpdate(
			{
				_id: new ObjectID(req.params.ticketID),
			},
			{
				$addToSet: { usersAssigned: new ObjectID(req.params.userID) },
			},
			{
				projection: { title: 1 },
			}
		);

		await users.updateOne(
			{
				_id: new ObjectID(req.params.userID),
			},
			{
				$push: {
					notifications: {
						_id: new ObjectID(),
						title: 'Added to Ticket',
						description: `You were assigned the ticket "${ticket.value.title}"`,
						read: false,
						dateCreated: new Date(),
					},
				},
			}
		);

		res.status(200).send('User added to ticket');
	}
);

router.delete(
	'/:projectID/:ticketID/user/:userID',
	auth('manageTickets'),
	async (req: Request, res: Response) => {

		// If they are a demo user ignore request
		if (req.user.isDemoUser) {
			return res.sendStatus(200);
		}

		const tickets: Collection = await dbHandler('tickets');

		await tickets.updateOne(
			{
				_id: new ObjectID(req.params.ticketID),
			},
			{
				$pull: { usersAssigned: new ObjectID(req.params.userID) },
			}
		);

		res.status(200).send('User removed from ticket');
	}
);

router.post(
	'/:projectID/:ticketID/comment',
	auth('comment'),
	async (req: Request, res: Response) => {

		// If they are a demo user ignore request
		if (req.user.isDemoUser) {
			return res.sendStatus(200);
		}

		//Validate the request
		const { error } = Joi.object({
			text: Joi.string().required(),
		}).validate(req.body);
		if (error) {
			return res.status(400).send(error.details[0].message);
		}
		const tickets: Collection = await dbHandler('tickets');
		const users: Collection = await dbHandler('users');

		const ticket: any = await tickets.findOneAndUpdate(
			{
				_id: new ObjectID(req.params.ticketID),
			},
			{
				$push: {
					comments: {
						createdBy: req.user._id,
						text: req.body.text,
						dateCreated: new Date(),
					},
				},
			},
			{
				projection: { title: 1, usersAssigned: 1 },
			}
		);

		for (const user of ticket.value.usersAssigned) {
			await users.updateOne(
				{
					_id: new ObjectID(user),
				},
				{
					$push: {
						notifications: {
							_id: new ObjectID(),
							title: 'Ticket Commented',
							description: `A new comment was posted to the ticket "${ticket.value.title}"`,
							read: false,
							dateCreated: new Date(),
						},
					},
				}
			);
		}

		res.status(201).send('Comment added to ticket');
	}
);

router.put(
	'/:projectID/:ticketID',
	auth('editTickets'),
	async (req: Request, res: Response) => {

		// If they are a demo user ignore request
		if (req.user.isDemoUser) {
			return res.sendStatus(200);
		}

		//Validate the request
		const { error } = Joi.object({
			status: Joi.string().valid('in progress', 'need info', 'closed'),
			severity: Joi.string().valid('low', 'medium', 'high', 'critical'),
			type: Joi.string().valid('bug', 'suggestion'),
		}).validate(req.body);
		if (error) {
			return res.status(400).send(error.details[0].message);
		}

		const tickets: Collection = await dbHandler('tickets');

		let historyEntry: {
			changes: Object[],
			changedBy: string,
			dateChanged: Date,
		} = {
			changes: [],
			changedBy: req.user.username,
			dateChanged: new Date(),
		};

		for (const key in req.body) {
			let oldValue = await tickets.findOneAndUpdate(
				{
					_id: new ObjectID(req.params.ticketID),
				},
				{
					$set: {
						[key]: req.body[key],
					},
				},
				{
					projection: { [key]: 1 },
				}
			);

			historyEntry.changes.push({
				propertyChanged: key,
				oldValue: oldValue.value[key],
				newValue: req.body[key],
			});
		}

		const ticket: any = await tickets.findOneAndUpdate(
			{
				_id: new ObjectID(req.params.ticketID),
			},
			{
				$push: {
					history: historyEntry,
				},
			},
			{
				projection: { createdBy: 1, title: 1 },
			}
		);

		// If they changed status to need info
		// then notify the user who created the ticket
		if (req.body.status === 'need info') {
			const users: Collection = await dbHandler('users');
			await users.updateOne(
				{
					_id: new ObjectID(ticket.value.createdBy),
				},
				{
					$push: {
						notifications: {
							_id: new ObjectID(),
							title: 'Ticket Needs Info',
							description: `A request for additional info was submitted on ticket "${ticket.value.title}"`,
							read: false,
							dateCreated: new Date(),
						},
					},
				}
			);
		}

		res.status(200).send('Ticket updated');
	}
);

export { router };
