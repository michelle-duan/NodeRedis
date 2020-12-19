const redis = require("redis");
const { promisify } = require("util");

function myDB() {
  const myDB = {};

  const client = redis.createClient();

  client.on("error", function (error) {
    console.error(error);
  });

  //display functionality
  myDB.getRegistrations = async function () {
    const zsmembers = promisify(client.smembers).bind(client);
    const phgetall = promisify(client.hgetall).bind(client);

    const ids = await zsmembers("registrations");

    console.log("Got course registration ids", ids);

    // Iterate over the ids to get the details
    const promises = [];
    for (let id of ids) {
      promises.push(phgetall("song:" + id));
    }

    const registrations = await Promise.all(promises);
    console.log("course registration details", registrations);

    return registrations;
  };

  //create functionality
  myDB.createRegistration = async function (song) {
    // Convert the callback-based client.incr into a promise
    const pincr = promisify(client.incr).bind(client);
    const phmset = promisify(client.hmset).bind(client);
    const psadd = promisify(client.sadd).bind(client);

    song.id = await pincr("countSongId");
    await phmset("song:" + song.id, song);
    return psadd("registrations", song.id);
  };

  //update functionality
  myDB.updateRegistration = async function (song) {
    const phmset = promisify(client.hmset).bind(client);

    return phmset("song:" + song.id, song);
  };

  //delete functionality
  myDB.deleteRegistration = async function (song) {
    const pdel = promisify(client.del).bind(client);
    const psrem = promisify(client.srem).bind(client);

    await pdel("song:" + song.id);
    return await psrem("registrations", song.id);
  };

  return myDB;
}

module.exports = myDB();
