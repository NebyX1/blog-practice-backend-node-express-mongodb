const validator = require("validator");
const path = require("path");
const Article = require("../models/Articles");
const fs = require("fs");

const prueba = (req, res) => {
  return res.status(200).json({
    msg: "Consulta exitosa",
  });
};

const probador = (req, res) => {
  return res.status(200).json({
    msg: "Conexión de endpoint exitosa",
  });
};

const crear = async (req, res) => {
  try {
    //Recoger parámetros por post para ser guardados
    let parametros = req.body;

    //Validar datos
    let validar_titulo =
      !validator.isEmpty(parametros.titulo) &&
      validator.isLength(parametros.titulo, { min: 5, max: undefined });
    let validar_contenido = !validator.isEmpty(parametros.contenido);

    if (!validar_titulo || !validar_contenido) {
      throw new Error("No se ha validado la información");
    }

    //Crear el objeto en el que se guardará la información recibida y asignar los valores del objeto creado basado en el modelo
    const articulo = new Article(parametros);

    //Guardar el artículo en la base de datos utilizando promesas
    const articuloGuardado = await articulo.save();

    return res.status(200).json({
      status: "success",
      articulo: articuloGuardado,
      msg: "El artículo fue enviado con éxito",
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      msg: "Faltan datos por enviar",
    });
  }
};

const listar = async (req, res) => {
  try {
    let query = Article.find({}).sort({ fecha: -1 });

    if (req.params.ultimos) {
      query = query.limit(3);
    }

    const articulos = await query.exec();

    if (!articulos) {
      return res.status(404).json({
        status: "error",
        mensaje: "No se han encontrado artículos",
      });
    }

    return res.status(200).send({
      status: "success",
      articulos,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      mensaje: "Error al buscar los artículos",
    });
  }
};

const uno = async (req, res) => {
  try {
    const id = req.params.id;
    const articulo = await Article.findById(id).exec();

    return res.status(200).json({
      status: "success",
      articulo,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      mensaje: "Artículo no encontrado",
    });
  }
};

const borrar = async (req, res) => {
  try {
    const id = req.params.id;

    const articuloEliminado = await Article.findByIdAndDelete(id).exec();

    if (!articuloEliminado) {
      return res.status(404).json({
        status: "error",
        mensaje: "No se ha encontrado el artículo",
      });
    }

    return res.status(200).json({
      status: "success",
      mensaje: "El artículo ha sido eliminado",
      articulo: articuloEliminado,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      mensaje: "Error al eliminar el artículo",
    });
  }
};

const editar = async (req, res) => {
  try {
    const id = req.params.id;

    const { titulo, contenido } = req.body;

    if (!titulo || !contenido) {
      return res.status(400).json({
        status: "error",
        mensaje: "Faltan datos para actualizar el artículo",
      });
    }

    const articuloActualizado = await Article.findByIdAndUpdate(
      id,
      { titulo, contenido },
      { new: true }
    ).exec();

    if (!articuloActualizado) {
      return res.status(404).json({
        status: "error",
        mensaje: "No se ha encontrado el artículo",
      });
    }

    return res.status(200).json({
      status: "success",
      mensaje: "El artículo ha sido actualizado",
      articulo: articuloActualizado,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      mensaje: "Error al actualizar el artículo",
    });
  }
};

const subir = async (req, res) => {
  if (!req.file && !req.files) {
    return res.status(404).json({
      status: "error",
      mensaje: "Petición no válida",
    });
  }

  let archivo = req.file.originalname;
  let archivo_split = archivo.split(".");
  let archivo_extension = archivo_split[1];

  if (
    archivo_extension !== "png" &&
    archivo_extension !== "jpg" &&
    archivo_extension !== "jpeg"
  ) {
    fs.unlink(req.file.path, (error) => {
      return res.status(400).json({
        status: "error",
        mensaje: "El formato de la imagen no es el correcto",
      });
    });
  } else {
    let articuloId = req.params.id;

    try {
      const articuloActualizado = await Article.findOneAndUpdate(
        { _id: articuloId },
        { imagen: req.file.filename },
        { new: true }
      );

      if (!articuloActualizado) {
        return res.status(500).json({
          status: "error",
          mensaje: "Error al actualizar",
        });
      }

      return res.status(200).json({
        status: "success",
        articulo: articuloActualizado,
        files: req.file,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        mensaje: "Error al actualizar",
      });
    }
  }
};

const imagen = (req, res) => {
  let fichero = req.params.fichero;
  let ruta_fisica = path.join(__dirname, '..', 'imagenes', 'articulos', fichero);

  fs.stat(ruta_fisica, (error, stats) => {
    if (!error && stats.isFile()) {
      return res.sendFile(path.resolve(ruta_fisica));
    } else {
      return res.status(404).json({
        status: "error",
        mensaje: "La imagen no existe",
      });
    }
  });
};


const buscador = async (req, res) => {
  let busqueda = req.params.busqueda;

  try {
    const articulosEncontrados = await Article.find({
      "$or": [
        {"titulo": {"$regex": busqueda, "$options":"i"}},
        {"contenido": {"$regex": busqueda, "$options":"i"}}
      ]
    }).sort({fecha: -1});

    if (!articulosEncontrados || articulosEncontrados.length <= 0) {
      return res.status(404).json({
        status: "error",
        mensaje: "No se han encontrado artículos"
      });
    }

    return res.status(200).json({
      status: "success",
      articulos: articulosEncontrados
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      mensaje: "Error al buscar los artículos"
    });
  }
};


module.exports = {
  prueba,
  probador,
  crear,
  listar,
  uno,
  borrar,
  editar,
  subir,
  imagen,
  buscador
};
