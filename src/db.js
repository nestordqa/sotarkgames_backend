require('dotenv').config();
const { Sequelize, DataTypes} = require('sequelize');
const fs = require('fs');
const path = require('path');
const {
  DB_USER, 
  DB_PASSWORD, 
  DB_HOST,
  API_KEY,
  DB_DEPLOY
} = process.env;

// const sequelize = new Sequelize(`postgres://${DB_USER}:${DB_PASSWORD}@localhost:${DB_HOST}/videogames`, {
//   define: {timestamps: false},
//   logging: false, // set to console.log to see the raw SQL queries
//   native: false, // lets Sequelize know we can use pg-native for ~30% more speed
// });
const sequelize = new Sequelize(DB_DEPLOY, {
  define: {timestamps: false},
  logging: false, // set to console.log to see the raw SQL queries
  native: false, // lets Sequelize know we can use pg-native for ~30% more speed
});
// Pruebo que se haya hecho correctamente la conexión entres ORM y DB
sequelize.authenticate().then(()=>console.log('Base de datos conectada con éxito!')).catch(err=> console.log({error: err}));
const basename = path.basename(__filename);

const modelDefiners = [];

// Leemos todos los archivos de la carpeta Models, los requerimos y agregamos al arreglo modelDefiners
fs.readdirSync(path.join(__dirname, '/models'))
  .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, '/models', file)));
  });


// Injectamos la conexion (sequelize) a todos los modelos
modelDefiners.forEach(model => model(sequelize));
// Capitalizamos los nombres de los modelos ie: product => Product
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [entry[0][0].toUpperCase() + entry[0].slice(1), entry[1]]);
sequelize.models = Object.fromEntries(capsEntries);

// En sequelize.models están todos los modelos importados como propiedades
// Para relacionarlos hacemos un destructuring

const { Videogame, Genres, VideogameGenre } = sequelize.models;


//Intento conectar sincronizar con la base de datos, por el index.js no me lo permite. Se logra, ver error en index.js
// sequelize.sync({force: true}).then(()=>console.log("Conectado papi")).catch((err)=>console.log({error: err.message}))

// Aca vendrian las relaciones
// Product.hasMany(Reviews);
Genres.belongsToMany(Videogame, {through: "videogame_genre"});
Videogame.belongsToMany(Genres, {through: "videogame_genre"});


module.exports = {
  ...sequelize.models, // para poder importar los modelos así: const { Product, User } = require('./db.js');
  conection: sequelize,     // para importart la conexión { conn } = require('./db.js');
  user: DB_USER,
  password: DB_PASSWORD,
  host: DB_HOST,
  apiKey: API_KEY
};

