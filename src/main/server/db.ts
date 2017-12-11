import * as mongoose from 'mongoose';

import './models/UserModel';
import './models/MatchModel';

(mongoose as any).Promise = Promise;

export default function(uri: string): Promise<mongoose.Connection> {
  if (!uri) {
    throw new Error('MongoDB uri is undfined');
  }

  return new Promise<mongoose.Connection>((resolve, reject) => {
    mongoose.connect(uri, {
      useMongoClient: true
    });

    mongoose.connection.on('error', () => {
      console.log('MongoDB connection error. Please make sure MongoDB is running.');
      process.exit();
    });

    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected', mongoose.connection.db.databaseName);
      resolve(mongoose.connection);
    });
  });
}
