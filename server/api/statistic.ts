import express, { Request, Response } from 'express';
import mongodb, { Collection, ObjectID } from 'mongodb';
import { dbHandler } from '../tools/db';
import { auth } from '../tools/auth';
const router = express.Router();

router.get('/type', auth('statistics'), async (req: Request, res: Response) => {
	const tickets: Collection = await dbHandler('tickets');

	const queryBug: any = await tickets.countDocuments({
		type: 'bug'
	});

	const querySuggestion: any = await tickets.countDocuments({
		type: 'suggestion'
	});

	res.status(200).send({
		bug: queryBug,
		suggestion: querySuggestion,
	});
});

router.get('/severity', auth('statistics'), async (req: Request, res: Response) => {
	const tickets: Collection = await dbHandler('tickets');

	let query: {
		low: number,
		medium: number,
		high: number,
		severe: number,
	} = {
		low: 0,
		medium: 0,
		high: 0,
		severe: 0,
	};

	query['low'] = await tickets.countDocuments({
		severity: 'low'
	});

	query['medium'] = await tickets.countDocuments({
		severity: 'medium'
	});

	query['high'] = await tickets.countDocuments({
		severity: 'high'
	});

	query['severe'] = await tickets.countDocuments({
		severity: 'severe'
	});

	res.status(200).send(query);
});

export { router };