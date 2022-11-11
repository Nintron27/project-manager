import express, { Request, Response } from 'express';
import mongodb, { Collection, ObjectID } from 'mongodb';
import { dbHandler } from '../tools/db';
import { auth } from '../tools/auth';
import Joi from 'joi';
const router = express.Router();

router.post('/', auth('admin'), async (req: Request, res: Response) => {
	//Validate the request
	const { error } = Joi.object({
		name: Joi.string().required().min(2),
		description: Joi.string().required(),
	}).validate(req.body);
	if (error) {
		return res.status(400).send(error.details[0].message);
	}

	const projects: Collection = await dbHandler('projects');

	const roleID = new ObjectID();

	await projects.insertOne({
		name: req.body.name,
		description: req.body.description,
		assignedUsers: [
			{
				_id: new ObjectID(req.user._id),
				role: roleID,
			},
		],
		roles: [
			{
				_id: roleID,
				name: 'Project Admin',
				permissions: [
					'editProject',
					'manageProjectRoles',
					'manageProjectUsers',
					'manageTickets',
					'createTickets',
					'editTickets',
					'comment',
					'statistics'
				],
			},
		],
	});

	res.status(201).send('Project added to database');
});

router.get(
	'/:projectID/unassigned',
	auth('manageProjectUsers'),
	async (req: Request, res: Response) => {
		const projects: Collection = await dbHandler('projects');
		const users: Collection = await dbHandler('users');

		let unassignedUsers = await users
			.find(
				{},
				{
					projection: { _id: 1, username: 1 },
				}
			)
			.toArray();

		let alreadyAssignedUsers = await projects.findOne(
			{
				_id: new ObjectID(req.params.projectID),
			},
			{
				projection: { assignedUsers: 1 },
			}
		);

		alreadyAssignedUsers = alreadyAssignedUsers.assignedUsers;

		for (let i = 0; i < unassignedUsers.length; i++) {
			for (const assignedUser of alreadyAssignedUsers) {
				if (
					new ObjectID(unassignedUsers[i]._id).equals(
						new ObjectID(assignedUser._id)
					)
				) {
					unassignedUsers.splice(i, 1);
				}
			}
		}

		res.status(200).send(unassignedUsers);
	}
);

router.get(
	'/:projectID/assigned',
	auth('manageProjectUsers'),
	async (req: Request, res: Response) => {
		const projects: Collection = await dbHandler('projects');
		const users: Collection = await dbHandler('users');

		let query = await projects.findOne(
			{
				_id: new ObjectID(req.params.projectID),
			},
			{
				projection: { assignedUsers: 1 },
			}
		);

		let assignedUsers = query.assignedUsers;

		for (const user of assignedUsers) {
			let query = await users.findOne(
				{
					_id: new ObjectID(user._id),
				},
				{
					projection: { username: 1 }
				}
			);
			user.username = query.username;
		}


		res.status(200).send(assignedUsers);
	}
);

router.post(
	'/:projectID/user',
	auth('manageProjectUsers'),
	async (req: Request, res: Response) => {

		// If they are a demo user ignore request
		if (req.user.isDemoUser) {
			return res.sendStatus(200);
		}

		//Validate the request
		const { error } = Joi.object({
			_id: Joi.string().required().hex().min(24).max(24),
			role: Joi.string().required().hex().min(24).max(24),
		}).validate(req.body);
		if (error) {
			return res.status(400).send(error.details[0].message);
		}

		const projects: Collection = await dbHandler('projects');
		const users: Collection = await dbHandler('users');

		const project: any = await projects.findOneAndUpdate(
			{
				_id: new mongodb.ObjectID(req.params.projectID),
			},
			{
				$push: {
					assignedUsers: {
						_id: new ObjectID(req.body._id),
						role: new ObjectID(req.body.role),
					},
				},
			},
			{
				projection: { name: 1 },
			}
		);

		// Give user a notification they were added
		await users.updateOne(
			{
				_id: new mongodb.ObjectID(req.body._id),
			},
			{
				$push: {
					notifications: {
						_id: new ObjectID(),
						title: 'Added to Project',
						description: `You were added to the project ${project.value.name}`,
						read: false,
						dateCreated: new Date(),
					},
				},
			}
		);

		res.status(201).send('User added to project');
	}
);

router.put(
	'/:projectID/user/:userID',
	auth('manageProjectUsers'),
	async (req: Request, res: Response) => {

		// If they are a demo user ignore request
		if (req.user.isDemoUser) {
			return res.sendStatus(200);
		}

		//Validate the request
		const { error } = Joi.object({
			role: Joi.string().required().hex().min(24).max(24),
		}).validate(req.body);
		if (error) {
			return res.status(400).send(error.details[0].message);
		}

		const projects: Collection = await dbHandler('projects');

		await projects.findOneAndUpdate(
			{
				_id: new mongodb.ObjectID(req.params.projectID),
				'assignedUsers._id': new mongodb.ObjectID(req.params.userID),
			},
			{
				$set: {
					'assignedUsers.$': {
						_id: new ObjectID(req.params.userID),
						role: new ObjectID(req.body.role),
					},
				},
			},
			{
				projection: { name: 1 },
			}
		);

		res.status(200).send('User project role updated');
	}
);

router.delete(
	'/:projectID/user/:userID',
	auth('manageProjectUsers'),
	async (req: Request, res: Response) => {

		// If they are a demo user ignore request
		if (req.user.isDemoUser) {
			return res.sendStatus(200);
		}

		const projects: Collection = await dbHandler('projects');

		await projects.updateOne(
			{ _id: new mongodb.ObjectID(req.params.projectID) },
			{
				$pull: {
					assignedUsers: {
						_id: new mongodb.ObjectID(req.params.userID),
					},
				},
			}
		);

		res.status(200).send('User removed from project');
	}
);

router.post(
	'/:projectID/role',
	auth('manageProjectRoles'),
	async (req: Request, res: Response) => {

		// If they are a demo user ignore request
		if (req.user.isDemoUser) {
			return res.sendStatus(200);
		}

		//Validate the request
		const { error } = Joi.object({
			name: Joi.string().required().min(2),
			permissions: Joi.array().required().items(Joi.string()),
		}).validate(req.body);
		if (error) {
			return res.status(400).send(error.details[0].message);
		}

		const projects: Collection = await dbHandler('projects');

		await projects.updateOne(
			{
				_id: new mongodb.ObjectID(req.params.projectID),
			},
			{
				$push: {
					roles: {
						_id: new ObjectID(),
						name: req.body.name,
						permissions: req.body.permissions,
					},
				},
			}
		);

		res.status(201).send('Role added to project');
	}
);

router.get(
	'/:projectID/role',
	auth('manageProjectRoles'),
	async (req: Request, res: Response) => {
		const projects: Collection = await dbHandler('projects');

		const query = await projects.findOne(
			{
				_id: new ObjectID(req.params.projectID)
			},
			{
				projection: { roles: 1 }
			}
		)

		res.status(201).send(query.roles);
	}
);

router.put(
	'/:projectID/role/:roleID',
	auth('manageProjectRoles'),
	async (req: Request, res: Response) => {

		// If they are a demo user ignore request
		if (req.user.isDemoUser) {
			return res.sendStatus(200);
		}

		//Validate the request
		const { error } = Joi.object({
			name: Joi.string().required().min(2),
			permissions: Joi.array().required().items(Joi.string()),
		}).validate(req.body);
		if (error) {
			return res.status(400).send(error.details[0].message);
		}

		const projects: Collection = await dbHandler('projects');

		await projects.findOneAndUpdate(
			{
				_id: new mongodb.ObjectID(req.params.projectID),
				'roles._id': new mongodb.ObjectID(req.params.roleID),
			},
			{
				$set: {
					'roles.$': {
						_id: new ObjectID(req.params.roleID),
						name: req.body.name,
						permissions: req.body.permissions,
					},
				},
			}
		);

		res.status(200).send('Role updated');
	}
);

router.delete(
	'/:projectID/role/:roleID',
	auth('manageProjectRoles'),
	async (req: Request, res: Response) => {

		// If they are a demo user ignore request
		if (req.user.isDemoUser) {
			return res.sendStatus(200);
		}

		const projects: Collection = await dbHandler('projects');

		await projects.updateOne(
			{ _id: new mongodb.ObjectID(req.params.projectID) },
			{
				$pull: {
					roles: {
						_id: new mongodb.ObjectID(req.params.roleID),
					},
				},
			}
		);

		res.status(200).send('Role deleted');
	}
);

router.put(
	'/:projectID',
	auth('editProject'),
	async (req: Request, res: Response) => {

		// If they are a demo user ignore request
		if (req.user.isDemoUser) {
			return res.sendStatus(200);
		}

		//Validate the request
		const { error } = Joi.object({
			name: Joi.string().min(2),
			description: Joi.string(),
		}).validate(req.body);
		if (error) {
			return res.status(400).send(error.details[0].message);
		}

		const projects: Collection = await dbHandler('projects');

		for (const key in req.body) {
			await projects.updateOne(
				{ _id: new mongodb.ObjectID(req.params.projectID) },
				{ $set: { [key]: req.body[key] } }
			);
		}

		res.status(200).send('Project changed');
	}
);

router.delete(
	'/:projectID',
	auth('admin'),
	async (req: Request, res: Response) => {
		const projects: Collection = await dbHandler('projects');

		projects.deleteOne({ _id: new mongodb.ObjectID(req.params.projectID) });

		res.status(200).send('Project removed from database');
	}
);

export { router };
