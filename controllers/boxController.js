const importaBox = require('../domain/box');
const Meeseeks = require('../models/meeseeks');
const Boxes = require('../models/boxes');
const meeseeks = require('../models/meeseeks');

/**
 * Callbacks functions para el controller Box
 * 
 * Closure sobre reality y box para 
 * guardar la caja y los meeseeks
 * entre llamadas a los endpoints,
 * simulando que de algún modo dispongo de una bbdd.
 * Esto no es stateless por lo que 
 * estoy cargándome el RESTFULL...
 * hasta que implementé la bbdd.
 */


var boxAPI = (function singleController() {

    let reality = [];
    let box = importaBox.singletonBox.getBox();
    // el primer meeseeks es el prototipo
    box.pressButton(reality);

    // get a meeseeks box

    const factory = function(req, res, next) {
        // box tiene una referencia onetoone a un meeseeks
        // Ese meeseeks ha de existir en la bbdd
        // Crearlo primero y relacionarlo con box
        // por la _id que MongoDB asigna al doc meeseeks
        // en la bbdd 
        let meeseeksInstance = new Meeseeks(
            // dentro de new Meeseeks
            // this no es boxAPI !!
            box.getProtoMeeseks()
        );

        meeseeksInstance.save(function (err) {
            if (err) return next(err);
        });

        let boxInstance = new Boxes(
            {
                name: `${req.params.owner}'s box`,
                mrMeeseeks: meeseeksInstance._id
            }
        );

        boxInstance.save(function (err) {
            if (err) return handleError(err);
        });
        
        res.status(200).type('json').json(boxInstance);
    }
    
    // get a meeseeks
    
    const createMeeseeks = function(req, res, next) {
        box.pressButton(reality);
        console.log("reality length = ", reality.length);

        // destructuring
        // Utilizo destructurig para forzar la busqueda en
        // la cadena de prototipos del objeto MrMeeseeks {} 
        // de sus propiedades message. Lo que hay en 
        // reality es un objeto sin own properties 
        // MrMeeseeks {} cuyo prototipo es el objeto
        // que está en la propiedad this.mrMeeseeks
        // de box
        let {messageOnCreate: hi, messageOnRequest: greetings} = reality.pop();

        // a la bbdd
        let meeseeksInstance = new Meeseeks(
            {   
                messageOnCreate: hi, 
                messageOnRequest: greetings
            }
        );

        meeseeksInstance.save(function (err) {
            if (err) return next(err);
        });

        res.status(200).type('json').json(meeseeksInstance);
    }

    // get meeseeks por parametro

    const getBox = ( (req, res, next) => {
        Boxes.findOne({ 'name': `${req.params.owner}'s box` })
            .exec(function (err, ownerBox) {
                if (err) { return next(err); }
                // Successful, so render.
                res.status(200).type('json').json(ownerBox);
        })
    })

    const deleteBox = function(req, res, next) {
        // los metodos de moongoose elegidos se basan en poder lanzar
        // el middleware de mongoose en pre y post y si el middleware
        // se ejecuta en la query o en el documento.
        // Ver modelo de Boxes.
        // findOneAndDelete dispara el middleware post del mismo nombre.
        // Quiero implementar un CASCADE de SQL.
        // Uso el middleware post para eliminar
        // el documento meeseeks que referencia la box a eliminar
        // Ver en el hook en modelo boxes
        Boxes.findOneAndDelete({ 'name': `${req.params.owner}'s box` })
            // Finds a matching document, removes it, and passes 
            // the found document (if any) to the callback.
            .exec(function (err, deletedBox) {
                if (err) { return next(err); }
                console.log("deletedMees = " + deletedBox.mrMeeseeks._id.toString())
                res.status(200).type('json').json(deletedBox);
                // uso middleware post de mongoose y no redirect
                // porque redirect no termina antes de que termine
                // el caso test de Jest. 
                // res.redirect('/reality/explode/' + deletedBox.mrMeeseeks._id.toString());
            })
    }

    const getAllBoxes = ( (req, res, next) => {
        Boxes.find()
            .exec(function (err, boxes) {
                if (err) { return next(err); }
                res.status(200).type('json').json(boxes);
            })
    })
    
    // public API
    return {
        factory,
        createMeeseeks,
        getBox,
        deleteBox,
        getAllBoxes
    };
})(); 


exports.boxAPI = boxAPI;
