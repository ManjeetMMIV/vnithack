require('dotenv').config();
const neo4j = require('neo4j-driver');

let driverInstance = null;

function getDriver() {
  if (!driverInstance) {
    const uri = process.env.NEO4J_URI;
    const user = process.env.NEO4J_USER || '0ea2e782';
    const password = process.env.NEO4J_PASSWORD;

    if (!uri || !password) {
      throw new Error('NEO4J_URI and NEO4J_PASSWORD must be defined in .env');
    }

    driverInstance = neo4j.driver(
      uri,
      neo4j.auth.basic(user, password),
      {
        maxConnectionPoolSize: 20,
        connectionTimeout: 15000,
      }
    );
  }
  return driverInstance;
}

async function runQuery(cypher, params = {}) {
  const driver = getDriver();
  const session = driver.session();
  try {
    const result = await session.run(cypher, params);
    return result.records;
  } finally {
    await session.close();
  }
}

async function closeDriver() {
  if (driverInstance) {
    await driverInstance.close();
    driverInstance = null;
  }
}

module.exports = {
  getDriver,
  runQuery,
  closeDriver,
};
