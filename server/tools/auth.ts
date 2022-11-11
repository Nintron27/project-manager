import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Joi, { compile } from 'joi';
import { ObjectID } from 'mongodb';

export function auth(permission: string) {
	return async function (req: Request, res: Response, next: NextFunction) {
		// Get token and check if it exists
		const token: string | undefined = req.header('Authorization');
		if (!token) {
			return res.status(401).send('Missing JWT');
		}

		const TOKEN_SECRET: any = process.env.TOKEN_SECRET;

		// Verify token and assign it to req.user
		try {
			req.user = jwt.verify(token.split(' ')[1], TOKEN_SECRET) as {
				_id: string;
				username: string;
				isAdmin: boolean;
				isDemoUser: boolean;
				projects: [
					{
						_id: string;
						role: string;
						permissions: string[];
					},
				];
			};
		} catch (error) {
			return res.status(400).send('Invalid Token');
		}

		// Validate their ID params
		const { error } = Joi.object({
			projectID: Joi.string().hex().length(24),
			userID: Joi.string().hex().length(24),
			roleID: Joi.string().hex().length(24),
			ticketID: Joi.string().hex().length(24),
			notificationID: Joi.string().hex().length(24),
		}).validate(req.params);
		if (error) {
			return res.status(400).send('Invalid ID param');
		}

		for (let i = 0; i < req.user.projects.length; i++) {
			if (
				new ObjectID(req.user.projects[i]._id).equals(
					new ObjectID(req.params.projectID)
				)
			) {
				req.permissions = req.user.projects[i].permissions;
			}
		}

		// If permission is empty than no need to check
		if (permission === '') {
			return next();
		}

		// If they are admin override checking their perms
		if (req.user.isAdmin) {
			return next();
		} else if (permission === 'admin') {
			return res.status(403).send(`This request requires being admin`);
		}

		// Loop through their projects until you get to one that matches
		// the projectID they are attempted to modify, once you get that
		// loop through their permissions on the project to see
		// if they have permission for this request.
		// Additionally, while doing this push their project permissions onto
		// the permissions field of Request to be used for any
		//	future permission checking.
		let hasProjectRole = false;
		try {
			for (let i = 0; i < req.user.projects.length; i++) {
				if (
					new ObjectID(req.user.projects[i]._id).equals(
						new ObjectID(req.params.projectID)
					)
				) {
					for (
						let j = 0;
						j < req.user.projects[i].permissions.length;
						j++
					) {
						if (
							req.user.projects[i].permissions[j] === permission
						) {
							hasProjectRole = true;
						}
					}
				}
			}
		} catch (error) {
			return res.status(400).send('Invalid Token');
		}

		if (hasProjectRole) {
			return next();
		} else {
			res.status(403).send(`This request requires the ${permission} role`);
		}
	};
}
