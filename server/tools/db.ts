import mongodb, { Collection } from 'mongodb';

export async function dbHandler(collection: string): Promise<Collection> {

	const connectionString: any = process.env.DB_CONNECT;

	const client = await mongodb.MongoClient.connect(
		connectionString,
		{
			useNewUrlParser: true,
			useUnifiedTopology: true,
		}
	);

	return client.db('projectManager').collection(collection);
};