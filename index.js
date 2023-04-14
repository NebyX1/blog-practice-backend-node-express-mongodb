const { connection } = require("./database/connection")
const express = require("express");
const cors = require("cors");

//Conectar a la base de datos
connection();

//Crear servidor Node
const app = express();
const puerto = 3900;

//Configuración de cors
app.use(cors());

//Convertir body a objeto js
app.use(express.json()); //esto sirve para utilizar datos en formato json
app.use(express.urlencoded({extended:true})); //esto permite decodificar desde formato de formulario no json

//rutas
const rutas_articulo = require("./routes/ArticleRoute")


//cargar rutas
app.use("/api", rutas_articulo);


app.get("/probar", (req, res) => {

//     return res.status(200).send(`
//         <div>
// <h1>Endpoint Funcionando</h1>
// <p style="color:green;">Esto demuestra que nuestro Endpoint está devolviendo una respuesta en formato html</p>
//         </div>
//         `);
    
    return res.status(200).json({
        msg:"Conexión de endpoint exitosa"
        });

    });

//configuración de cors
app.listen(puerto, () => {
    console.log("Servidor corriendo en el puerto "+puerto)
    })