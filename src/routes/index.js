const { Router } = require('express');
const axios = require('axios');
// const {apiKey}= require('../db') //Requiero apiKey de .env
const { Videogame, Genres, videogame_genre} = require('../db.js') //Requiero Models y la conexion (Por si se llega a necesitar)
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');

const router = Router();

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);
const apiKey = `0bb26f3ab5ab4cf99a4487db7d75696c`


//AGREGA TODOS LOS JUEGOS DE LA API A LA DB
router.post('/allVideogames',async(req,res)=>{


    try{
        var getAll = [];
    for(let i = 1; i < 7; i++){
        var url = `https://api.rawg.io/api/games?key=${apiKey}&page=${i}`;
        var list = await axios.get(url);
            //mapeo cada resultado para traerme lo que necesito;
            var getAPart = list.data.results.map((game)=>{
                return({
                    Id: game.id,
                    Nombre: game.name,
                    Descripcion: game.slug,
                    Fecha_lanzamiento: game.released,
                    Rating: game.rating,
                    Plataformas: game.parent_platforms.map(plat=>plat.platform.name),
                    Img_URL: game.background_image,
                    Generos: game.genres.map(gen=>gen.name)
                })
            });
            getAll = [...getAll, ...getAPart];
            
    };                                              // RECORDAR, PRIMERO CREAR OBJERO Y LUEGO ENCERRARLO EN {}
    const videogameDB = await Videogame.findAll({include: [{model: Genres}]});
    
    // console.log(videogameDB) //CON ESTO PRUEBO QUE HAYA TRAIDO CORRECTAMENTE VIDEOGAME
    const allAtAll = [...getAll, ...videogameDB];
     //Contateno ambos arreglos con el spread
     for(let i = 0; i < allAtAll.length; i++){
        var newGame= await Videogame.create({
            Id_Game: allAtAll[i].Id,
            Nombre: allAtAll[i].Nombre,
            Descripcion: allAtAll[i].Descripcion,
            Fecha_lanzamiento: allAtAll[i].Fecha_lanzamiento,
            Rating: Math.floor(allAtAll[i].Rating),
            Plataformas: allAtAll[i].Plataformas,
            Img_URL: allAtAll[i].Img_URL,
            Generos:allAtAll[i].Generos
            
        });
        
    };
     res.status(201).json("Base de datos cargada exitosamente!")

    }catch(err){
        res.status(401).json({ERROR: err.message});
    }
     
         


});

//TRAE TODOS LOS VIDEOJUEGOS SI NO SE LA PASA NADA POR QUERY.
//SI SE LE PASA NAME POR QUERY, BUSCA LOS PRIMEROS 15 JUEGOS ENCONTRADOS Y SI NO ENCUENTRA NADA, DEVUELVE UN ERROR.
router.get('/videogames', async(req,res)=>{
    const name = req.query.name; 

    try{
        var getAll = [];
        for(let i = 1; i < 7; i++){ //Hago un bucle que vaya a ver 05 rutas para traer videojuegos.
            var url = `https://api.rawg.io/api/games?key=${apiKey}&page=${i}`; 
            var list = await axios.get(url); //Traigo la ruta según el valor de i en el bucle.
            var finalList = list.data.results; //Accedo directamente a la data del objeto que trae axios, y a results que es quién tiene toda la informacion que necesito.
                    var mapping = finalList.map((game)=>{
                        return({
                        Id: game.id,
                        Nombre: game.name,
                        Fecha_lanzamiento: game.released,
                        Rating: game.rating,
                        Plataformas: game.parent_platforms.map(plat=>plat.platform.name),
                        Img_URL: game.background_image,                        
                        Generos: game.genres.map(gen=>gen.name)
                    })});
                    getAll = [...getAll, ...mapping]

                };

        const videogameDB = await Videogame.findAll({where:{Created:true}}); 
        console.log(videogameDB);   
        //N O T A: ME TRAIGO EL LISTADO ENTERO PARA COMPARAR JUEGO POR JUEGO Y TRAERME SOLO LOS QUE CONTIENEN ESE GÉNERO
        // console.log(videogameDB) //CON ESTO PRUEBO QUE HAYA TRAIDO CORRECTAMENTE VIDEOGAME
        const allAtAll = [...getAll, ...videogameDB]; //Contateno ambos arreglos con el spread;
        // console.log(allAtAll.length); //Chequeo que traiga la cantidad de elementos que necesito
        // console.log(videogameDB); //Chequeo qué trae de la DB
        // console.log(allAtAll) //Chequeo el contenido de aquello que me traigo de la API.
        if(!name){
            res.status(200).json(allAtAll);
        }else if(name){
            var lower = name.toLocaleLowerCase();
            var finder = allAtAll.filter(item=>item.Nombre.toLocaleLowerCase().includes(lower));
            var found = finder.filter((item, index)=>index<15);
            if(found.length > 0){
                res.status(200).json(found);
            }else if(found.length == 0){
                throw new Error("El videojuego ingresado no existe, intenta nuevamente")
            }    
            
        };
    }catch(err){
        res.status(400).json(err)
    }
});

//POSTEA UN VIDEOJUEGO PASADO POR BODY;
router.post('/videogames', async(req,res)=>{
    const {Nombre, Descripcion, Fecha_lanzamiento, Rating, Plataformas, Img_URL, Generos, Like} = req.body; //Traigo todos datos a cargar en DB
    try{
        if(!Nombre || !Descripcion || !Plataformas || !Img_URL || !Generos){ // Chequeo que no falten aquellos que son imprescindibles
            res.status(400).json({Error: "Faltan datos"})
        }else{          
            var newGame= await Videogame.create({Nombre, Descripcion, Fecha_lanzamiento, Rating, Plataformas, Img_URL, Created: true, Generos, Like}); //Se sube nuevo videogame a DB
            res.status(200).json(newGame);
        }
    }catch(err){
        res.status(400).json({Error: err.message})
    }
});

// TRAE UN VIDEOJUEGO BUSCADO A TRAVÉS DE SU ID PASADO POR PARAMS.
router.get('/videogames/:id', async(req, res)=>{
    var id= req.params.id;
    var toString = id.toString();
    
    try{
        
        
        if(toString.length < 10){
            var findId = await Videogame.findAll({where: {Id_Game: id}});//Busco primero en base de datos para una búsqueda más rápida y limpia
            if(findId.length == 1){
                res.status(200).json(findId);
            }else{
                var finder = await axios.get(`https://api.rawg.io/api/games/${id}?key=${apiKey}`); //Para salir de dudas, pido info a la api, si existe buenisimo.
                var description = await axios.get(`https://api.rawg.io/api/games/${id}?key=${apiKey}`);
                var description = description.data.description_raw;
                var result =
                {
                    Id: finder.data.id,
                    Nombre: finder.data.name,
                    Descripcion: description,
                    Fecha_lanzamiento: finder.data.released,
                    Rating: finder.data.rating,
                    Plataformas: finder.data.parent_platforms.map(plat=>plat.platform.name),
                    Img_URL: finder.data.background_image,
                    Generos: finder.data.genres.map(gen=>gen.name),
                    
                }
            res.status(200).json(result);
            }
            
        }else if(toString.length == 36){
            var findIdDB = await Videogame.findAll({where: {Id: id}});//Verifico si fue creado o no, si fue creado el ID no será el mismo que el de la API
            if(findIdDB.length == 1){
                res.status(200).json(...findIdDB);
            }else{
                res.status(404).json({Error: "Juego no encontrado"});
            }
            
        }else{
            
        }}catch(err){
        res.status(400).json({Error: err.message})
    }
});

//TRAE TODOS LOS GÉNEROS, Y DE NO EXISTIR EN LA BASE DE DATOS (MODEL GENRES), LOS AGREGA.

router.get('/genres', async(req,res)=>{   

    try{        
        var genresList = await Genres.findAll();
        if(genresList.length >= 19){
            res.status(200).json(genresList)
        }else{
            var findGenres = await axios.get(`https://api.rawg.io/api/genres?key=${apiKey}`);
            var foundGenres = findGenres.data.results;
            for(let i = 0; i < foundGenres.length; i++){
                var newGenre= await Genres.create({
                    Nombre: foundGenres[i].name,
                    Img: foundGenres[i].image_background,
                    Created: true                
                });
            };
            var list = await Genres.findAll();
            res.status(200).json(list);
        };        
    }catch(err){
        res.status(400).json({Error: err.message});
    };
});


//Traigo solo los videojuegos que coincidan con un género pasado por params.

router.get('/genres/:genero', async(req,res)=>{
    var genre = req.params.genero;
    var getAll = [];
            for(let i = 1; i < 7; i++){ //Hago un bucle que vaya a ver 05 rutas para traer videojuegos.
                var url = `https://api.rawg.io/api/games?key=${apiKey}&page=${i}`; 
                var list = await axios.get(url); //Traigo la ruta según el valor de i en el bucle.
                var finalList = list.data.results; //Accedo directamente a la data del objeto que trae axios, y a results que es quién tiene toda la informacion que necesito.
    
                        var mapping = finalList.map((game)=>{
                            return({
                            Id: game.id,
                            Nombre: game.name,
                            Fecha_lanzamiento: game.released,
                            Rating: game.rating,
                            Plataformas: game.parent_platforms.map(plat=>plat.platform.name),
                            Img_URL: game.background_image,
                            Generos: game.genres.map(gen=>gen.name)
                        })});
                        getAll = [...getAll, ...mapping]
    
                    };
    
            const videogameDB = await Videogame.findAll({where:{Created:true}});    
            //N O T A: ME TRAIGO EL LISTADO ENTERO PARA COMPARAR JUEGO POR JUEGO Y TRAERME SOLO LOS QUE CONTIENEN ESE GÉNERO
            const allAtAll = [...getAll, ...videogameDB]; //Contateno ambos arreglos con el spread;
    try{
        if(genre == "all"){
            res.status(201).json(allAtAll);          
        }else if(genre){            
            var filtrado = allAtAll.filter(item =>item.Generos.includes(genre));
            console.log(filtrado);
            if(filtrado.length == 0){
                res.status(404).json({Error: "Género no encontrado."})
            }else{
                res.status(201).json(filtrado)
            };            
        };
    }catch(err){
        res.status(404).json({Error: err.message})
    };
    
});


module.exports = router;
