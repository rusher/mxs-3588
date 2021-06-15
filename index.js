const mariadb = require('mariadb');

// max_allowed_packet must be >= 16M
const test = async function() {
  const conn = await mariadb.createConnection({
    user: 'boby',
    password: 'heyPassw0-rd',
    database: 'testj',
    host: 'localhost',
    connectTimeout: 1000,
    port: 4006,
    maxAllowedPacket: 16 * 1024 * 1024,
    debug: true
  });

  await conn.query('DROP TABLE IF EXISTS bigBatchWith16mMaxAllowedPacket');
  await conn.query(
    'CREATE TABLE bigBatchWith16mMaxAllowedPacket(id int, id2 int, id3 int, t varchar(128), id4 int) CHARSET utf8mb4'
  );
  await conn.query('FLUSH TABLES');
  await conn.query('START TRANSACTION');

  const str = "abcdefghijkflmn'opqrtuvwx🤘💪";
  const values = [];
  for (let i = 0; i < 1000000; i++) {
    values.push([i, str]);
  }

  let res = await conn.batch(
    'INSERT INTO `bigBatchWith16mMaxAllowedPacket` values (1, ?, 2, ?, 3)',
    values
  );
  assert.equal(res.affectedRows, 1000000);

  await conn.query('ROLLBACK');
  conn.end();
}

test();
