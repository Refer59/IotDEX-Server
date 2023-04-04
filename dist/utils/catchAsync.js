// Esta funcion retorna otra funcion, LA cual EJECUTA la funcion "fn" dada, Y EN CASO de que esa funcion "fn"
// (Al ser una Promesa tiene una funcion catch) falle, entonces se le pasara el error objeto onReject del catch a la funcion next
// Y como sabemos que cuando se le pasa algo como argumento a la funcion next express detectara como que hubo un fallo y se saltara todos los middleware
// hasta llegar al Global Error Middleware y procesar el error
const catchAsync = (fn, dataForCallback) => {
    return (req, res, next) => {
        fn(req, res, next, dataForCallback).catch(next); // (error) => algunCodigo === (error) => next(error), al ser Next una funcion y pasarse como argumento entonces
        // se usa como callback, el cual recibira el objeto onReject (error) de catch como primer y unico argumento
    };
};
export default catchAsync;
//# sourceMappingURL=catchAsync.js.map