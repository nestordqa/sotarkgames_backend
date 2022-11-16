const { DataTypes, UUID } = require('sequelize');
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.


//Me traigo modelo que debe ir en model

module.exports = (sequelize) => {
  // defino el modelo
  sequelize.define('videogame', {
    
    Id:{
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    Id_Game:{
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      
    },
    Nombre:{
      type: DataTypes.STRING,
      allowNull: false
    },
    Descripcion:{
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "Sin descripción",
    },
    Fecha_lanzamiento: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: DataTypes.NOW
    },
    Rating:{
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },

    Img_URL:{
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Sin imagen"
    },

    Created:{
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    Plataformas:{
      type: DataTypes.ARRAY(DataTypes.JSON),

    },
    Generos:{
      type: DataTypes.ARRAY(DataTypes.JSON),

    },
    Like:{
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false

    }
  });


};

