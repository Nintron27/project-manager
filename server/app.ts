import express, { Application } from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
const app: Application = express();

// Import ENV variables
dotenv.config();

// Importing routes
import { router as project } from './api/project';
import { router as ticket } from './api/ticket';
import { router as user } from './api/user';
import { router as statistic } from './api/statistic';

// Middlewares
app.use(helmet({
	contentSecurityPolicy: false,
	expectCt: false,
	hsts: false,
	dnsPrefetchControl: false,
}));
app.use(express.json());

// Route Middlewares
app.use('/api/project', project);
app.use('/api/ticket', ticket);
app.use('/api/user', user);
app.use('/api/statistic', statistic);

// Handle a production environment
if (process.env.NODE_ENV == 'production') {
	console.log('production mode detected');

	// Static folder
	app.use(express.static(__dirname + '/public/'));

	// Route all 'gets' to  public/index.html for VueJS
	app.get(/.*/, (req, res) => res.sendFile(__dirname + '/public/index.html'));
}

const port: any = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server started on port: ${port}`));
