import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const uri = process.env.COGNODB_URI;
const user = process.env.COGNODB_USERNAME;
const password = process.env.COGNODB_PASSWORD;

if (!uri || !user || !password) {
  console.warn('Missing CognoDB connection details. Check your .env file.');
}

const driver = neo4j.driver(
  uri || 'bolt://localhost:7687',
  neo4j.auth.basic(user || 'neo4j', password || 'password')
);

export const getSession = () => {
  return driver.session();
};

export const closeDriver = async () => {
  await driver.close();
};

export default driver;
