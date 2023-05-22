const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const connect = mongoose.connection;
/**
 * Mongod DB Connecter
 * @param {String} url Database Connection Url  example `mongodb://localhost:27017/` NOT REQURIED, If Not Specified it checked the ENV for `MONGO_URL`
 * 
 */
const connectDB = async (url) => {
  connect.on('connected', async () => {
    console.log('MongoDB Connection Established');
  });

  connect.on('reconnected', async () => {
    console.log('MongoDB Connection Reestablished');
  });

  connect.on('disconnected', () => {
    console.log('Mongo Connection Disconnected');
    console.log('Trying to reconnect to Mongo ...');

    setTimeout(() => {
      mongoose.connect(url ? url : process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        keepAlive: true,
        socketTimeoutMS: 3000,
        connectTimeoutMS: 3000
      });
    }, 3000);
  });

  connect.on('close', () => {
    console.log('Mongo Connection Closed');
  });
  connect.on('error', (error) => {
    console.log('Mongo Connection ERROR: ' + error);
  });

  await mongoose
    .connect(url ? url : process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .catch((error) => console.log(error));
};

module.exports = { connectDB, connect };
