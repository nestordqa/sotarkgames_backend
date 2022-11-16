const { DataTypes } = require('sequelize');
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
  // defino el modelo
  sequelize.define('genres', {

    Nombre:{ //Le asigno nombre
      type: DataTypes.STRING,
    },
    Img:{ //Guardo la URL de la imagen que trae la api, podría servir para algo
      type: DataTypes.STRING,
      defaultValue: "Sin imagen"
    },

  });


};