//                       _oo0oo_
//                      o8888888o
//                      88" . "88
//                      (| -_- |)
//                      0\  =  /0
//                    ___/`---'\___
//                  .' \\|     |// '.
//                 / \\|||  :  |||// \
//                / _||||| -:- |||||- \
//               |   | \\\  -  /// |   |
//               | \_|  ''\---/''  |_/ |
//               \  .-\__  '-'  ___/-. /
//             ___'. .'  /--.--\  `. .'___
//          ."" '<  `.___\_<|>_/___.' >' "".
//         | | :  `- \`.;`\ _ /`;.`/ - ` : | |
//         \  \ `_.   \_ __\ /__ _/   .-` /  /
//     =====`-.____`.___ \_____/___.-`___.-'=====
//                       `=---='
//     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const server = require('./src/app.js');
require('dotenv').config();
const {
  DB_USER, DB_PASSWORD, DB_HOST,
} = process.env;
const { conection } = require('./src/db.js');


// Syncing all the models at once.


  server.listen(3001, () => {
    console.log('Server listening at port 3001'); // eslint-disable-line no-console
    //Sincronizo con mi DB.
    conection.sync({force: true}).then(()=>console.log("Base de datos sincronizada con éxito!")).catch((err)=>console.log({error: err.message}))
  });

