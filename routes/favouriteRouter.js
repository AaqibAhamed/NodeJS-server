const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favourites = require('../models/favourite');

const favouriteRouter = express.Router();

favouriteRouter.use(bodyParser.json());

favouriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favourites.findOne({ user: req.user._id }, (err, favourite) => {
            if (err) { return next(err); }
            if (!favourite) {
                res.statusCode = 403;
                res.end("No favorite Dishes found!!");
            }
        })
            .populate('user')
            .populate('dishesList')
            .then((favourites) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favourites);
            }, (err) => next(err));
    })

    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        // check whether this dish has already been added to favorite
        // check whether this dish has already been added to favorite
        Favourites.findOne({ user: req.user._id }, (err, favourite) => {
            if (err) { return next(err); }
            if (!favourite) {
                Favourites.create({ user: req.user._id })
                    .then((favourite) => {
                        for (var dish = 0; dish < req.body.dishes.length; dish++) {
                            favourite.dishes.push(req.body.dishes[dish]);
                        }
                        favorite.save()
                            .then((favourite) => {
                                console.log('favourite Created ', favourite);
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favourite);
                            });
                    }, (err) => next(err))
                    .catch((err) => next(err));
            } else {
                for (var dish = 0; dish < req.body.dishes.length; dish++) {
                    if (favourite.dishes.indexOf(req.body.dishes[dish]) < 0) {
                        favourite.dishes.push(req.body.dishes[dish]);
                    }
                }
                favourite.save()
                    .then((favourite) => {
                        console.log('favorite added ', favourite);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favourite);
                    });
            }
        });
    })

    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favourite');
    })

    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favourites.remove({ user: req.user._id })
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });


favouriteRouter.route('/:dishId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, authenticate.verifyUser, (req,res,next) => {
        Favorites.findOne({user: req.user._id})
        .then((favorites) => {
            if (!favorites) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": false, "favorites": favorites});
            }
            else {
                if (favorites.dishes.indexOf(req.params.dishId) < 0) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.json({"exists": false, "favorites": favorites});
                }
                else {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.json({"exists": true, "favorites": favorites});
                }
            }
    
        }, (err) => next(err))
        .catch((err) => next(err))
    })

    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        // check whether this dish has already been added to favorite
        Favourites.findOne({ user: req.user._id }, (err, favourite) => {
            if (err) { return next(err); }
            if (!favourite) {
                Favourites.create({ user: req.user._id })
                    .then((favourite) => {
                        favourite.dishes.push(req.params.dishId);
                        favourite.save()
                            .then((favourite) => {
                                console.log('favourite Created ', favourite);
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favourite);
                            });
                    }, (err) => next(err))
                    .catch((err) => next(err));
            } else {
                if (favourite.dishes.indexOf(req.params.dishId) < 0) {
                    favourite.dishes.push(req.params.dishId);
                    favourite.save()
                        .then((favourite) => {
                            console.log('favourite added ', favourite);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favourite);
                        });
                } else {
                    res.statusCode = 200;
                    res.end("favourite already added");
                }
            }
        });
    })

    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favourites' );
    })

    .delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
        Favourites.findOne({user: req.user._id}, (err,favourite) =>{
            if(err){
                return next(err);
            }
            if(!favourite){
                res.statusCode = 200;
                res.end("No favourite dishes to delete");
            }
            var index = favourite.dishes.indexOf(req.params.dishId);
            if(index>-1)
            {
                favourite.dishes.splice(index,1);
                favourite.save()
                .then((resp) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(resp);
                }, (err) => next(err))
                .catch((err) => next(err));
            }
        });
    });

    module.exports = favouriteRouter;
