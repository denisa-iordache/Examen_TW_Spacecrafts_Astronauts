"use strict";
// Express Initialisation
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
// const path = require('path')
const port = process.env.PORT || 8080;
const application = express();

application.use(cors());
// application.use(express.static(path.join(__dirname, 'build')))
application.use(bodyParser.json());

// Sequelize Initialisation
const sequelize = require("./sequelize");

// Import created models
const Spacecraft = require("./models/spacecraft");
const Astronaut = require("./models/astronaut");

// Define entities relationship
//Definirea relației dintre cele două entități - 0.3
Spacecraft.hasMany(Astronaut, { foreignKey: "id_spacecraft" });

// Express middleware
application.use(
  express.urlencoded({
    extended: true,
  })
);
application.use(express.json());

// Kickstart the Express aplication
application.listen(port, () => {
  console.log(`The server is running on http://localhost: ${port}.`);
});

// Create a middleware to handle 500 status errors.
application.use((error, request, response, next) => {
  console.error(`[ERROR]: ${error}`);
  response.status(500).json(error);
});

/**
 * Create a special GET endpoint so that when it is called it will
 * sync our database with the models.
 */
application.get("/create", async (request, response, next) => {
  try {
    await sequelize.sync({ force: true });
    response.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

/**
 * GET - afisare lista spacecrafts.
 */
// Operație GET pentru prima entitate - 0.3
// Filtrare după două câmpuri pentru prima entitate - 0.3
// Sortare după un câmp pentru prima entitate - 0.3
// Paginare pentru prima entitate - 0.3
application.get("/spacecrafts", async (request, response, next) => {
  try {
    const Op = require("sequelize").Op;
    const query = {};
    let pageSize = 2;
    const allowedFilters = ["nume", "viteza_maxima"];
    const filterKeys = Object.keys(request.query).filter(
      (e) => allowedFilters.indexOf(e) !== -1
    );
    if (filterKeys.length > 0) {
      query.where = {};
      for (const key of filterKeys) {
        if (isNaN(request.query[key]) == true) {
          query.where[key] = {
            [Op.like]: `%${request.query[key]}%`,
          };
        } else {
          query.where[key] = {
            [Op.eq]: parseFloat(request.query[key]),
          };
        }
      }
    }

    //const sortField = request.query.sortField;
    const sortField = "nume";
    let sortOrder = "ASC";
    if (request.query.sortOrder && request.query.sortOrder === "-1") {
      sortOrder = "DESC";
    }

    if (request.query.pageSize) {
      pageSize = parseInt(request.query.pageSize);
    }

    if (sortField) {
      query.order = [[sortField, sortOrder]];
    }

    if (!isNaN(parseInt(request.query.page))) {
      query.limit = pageSize; //->limit
      query.offset = pageSize * parseInt(request.query.page); //->skip
    }

    const records = await Spacecraft.findAll(query);
    const count = await Spacecraft.count();
    response.status(200).json({ records, count });
  } catch (e) {
    console.warn(e);
    response.status(500).json({ message: "server error" });
  }
});

/**
 * GET - afisarea unui anumit spacecraft
 */
//Operație GET pentru prima entitate - 0.3
application.get("/spacecrafts/:spacecraftId", async (req, res, next) => {
  try {
    const spacecraft = await Spacecraft.findByPk(req.params.spacecraftId);
    if (spacecraft) {
      res.status(200).json(spacecraft);
    } else {
      res.status(404).json({
        error: `Spacecraft cu id-ul ${req.params.spacecraftId} nu a fost gasit!`,
      });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * POST - adaugare spacecraft in baza de date
 */
//Operație POST pentru prima entitate - 0.3
application.post("/spacecrafts", async (request, response, next) => {
  try {
    const spacecraft = await Spacecraft.create(request.body);
    response.status(201).json({ message: "Spacecraft a fost adaugat!" });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT - actualizare spacecraft
 */
//Operație PUT pentru prima entitate - 0.3
application.put("/spacecrafts/:spacecraftId", async (req, res, next) => {
  try {
    const spacecraft = await Spacecraft.findByPk(req.params.spacecraftId);
    if (spacecraft) {
      await spacecraft.update(req.body);
      res.status(200).json({
        message: `Spacecraft cu id-ul ${req.params.spacecraftId} a fost actualizat!`,
      });
    } else {
      res.status(404).json({
        error: `Spacecraft cu id-ul ${req.params.spacecraftId} nu a fost gasit!`,
      });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE - stergere spacecraft
 */
//Operație DELETE pentru prima entitate - 0.3
application.delete("/spacecrafts/:spacecraftId", async (req, res, next) => {
  try {
    const spacecraft = await Spacecraft.findByPk(req.params.spacecraftId);
    if (spacecraft) {
      await spacecraft.destroy();
      res.status(200).json({
        message: `Spacecraft cu id-ul ${req.params.spacecraftId} a fost sters!`,
      });
    } else {
      res.status(404).json({
        error: `Spacecraft cu id-ul ${req.params.spacecraftId} nu a fost gasit!`,
      });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * GET - afisare astronauts pentru un spacecraft specificat.
 */
//Operație GET pentru a doua entitate ca subresursă - 0.3
application.get(
  "/spacecrafts/:spacecraftId/astronauts",
  async (request, response, next) => {
    try {
      const spacecraft = await Spacecraft.findByPk(request.params.spacecraftId);
      if (spacecraft) {
        const records = await spacecraft.getAstronauts();
        if (records.length > 0) {
          response.status(200).json({ records });
          //response.json(records);
        } else {
          response.sendStatus(204);
        }
      } else {
        response.sendStatus(404);
      }
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET - preluarea unui anumit astronaut dintr-un anumit spacecraft
 */
//Operație GET pentru a doua entitate ca subresursă - 0.3
application.get(
  "/spacecrafts/:spacecraftId/astronauts/:astronautId",
  async (req, res, next) => {
    try {
      const spacecraft = await Spacecraft.findByPk(req.params.spacecraftId);
      if (spacecraft) {
        const astronauts = await spacecraft.getAstronauts({
          where: { id: req.params.astronautId },
        });
        const astronaut = astronauts.shift();
        if (astronaut) {
          res.status(200).json(astronaut);
        } else {
          res.sendStatus(404);
        }
      } else {
        res.status(404).json({
          error: `Astronautul cu id-ul ${req.params.astronautId} nu a fost gasit!`,
        });
      }
    } catch (err) {
      next(error);
    }
  }
);

/**
 * POST - adaugare astronaut la spacecraft.
 */
//Operație POST pentru a doua entitate ca subresursă - 0.3
application.post(
  "/spacecrafts/:spacecraftId/astronauts",
  async (request, response, next) => {
    try {
      const spacecraft = await Spacecraft.findByPk(request.params.spacecraftId);
      if (spacecraft) {
        const astronaut = await Astronaut.create(request.body);
        spacecraft.addAstronaut(astronaut);
        await spacecraft.save();
        response.status(200).json(astronaut);
      } else {
        response.sendStatus(404);
      }
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT - actualizare astronaut dintr-un spacecraft specificat
 */
//Operație PUT pentru a doua entitate ca subresursă - 0.3
application.put(
  "/spacecrafts/:spacecraftId/astronauts/:astronautId",
  async (req, res, next) => {
    try {
      const spacecraft = await Spacecraft.findByPk(req.params.spacecraftId);
      if (spacecraft) {
        const astronauts = await spacecraft.getAstronauts({
          where: { id: req.params.astronautId },
        });
        const astronaut = astronauts.shift();
        if (astronaut) {
          await astronaut.update(req.body);
          res.status(200).json({
            message: `Astronautul cu id-ul ${req.params.astronautId} a fost actualizat!`,
          });
        } else {
          res.status(404).json({
            error: `Astronautul cu id-ul ${req.params.astronautId} nu a fost gasit!`,
          });
        }
      } else {
        response.sendStatus(404);
      }
    } catch (err) {
      next(err);
    }
  }
);

/**
 * DELETE - stergere astronaut de la spacecraft.
 */
//Operație DELETE pentru a doua entitate ca subresursă - 0.3
application.delete(
  "/spacecrafts/:spacecraftId/astronauts/:astronautId",
  async (request, response, next) => {
    try {
      const spacecraft = await Spacecraft.findByPk(request.params.spacecraftId);
      if (spacecraft) {
        const astronauts = await spacecraft.getAstronauts({
          where: { id: request.params.astronautId },
        });
        const astronaut = astronauts.shift();
        if (astronaut) {
          await astronaut.destroy();
          response.status(200).json({
            message: `Astronautul cu id-ul ${request.params.astronautId} a fost sters!`,
          });
        } else {
          response.status(404).json({
            error: `Astronautul cu id-ul ${request.params.astronautId} nu a fost gasit!`,
          });
        }
      } else {
        response.status(404).json({
          error: `Astronautul cu id-ul ${request.params.astronautId} nu a fost gasit!`,
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

//Import - 0.2
application.post("/import", async (request, response, next) => {
  try {
    const registry = {};
    for (let s of request.body) {
      const spacecraft = await Spacecraft.create(s);
      for (let a of s.astronauts) {
        const astronaut = await Astronaut.create(a);
        registry[a.key] = astronaut;
        spacecraft.addAstronaut(astronaut);
      }
      await spacecraft.save();
    }
    response.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

//Export - 0.2
application.get("/export", async (request, response, next) => {
  try {
    const result = [];
    for (let s of await Spacecraft.findAll()) {
      const spacecraft = {
        nume: s.nume,
        viteza_maxima: s.viteza_maxima,
        masa: s.masa,
        astronauts: [],
      };
      for (let a of await s.getAstronauts()) {
        spacecraft.astronauts.push({
          key: a.id,
          nume: a.nume,
          rol: a.rol,
        });
      }
      result.push(spacecraft);
    }
    if (result.length > 0) {
      response.json(result);
    } else {
      response.sendStatus(204);
    }
  } catch (error) {
    next(error);
  }
});
