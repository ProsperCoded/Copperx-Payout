function errorHandler(err, name, from){
    let loggerFunction = console.log;

    loggerFunction("====START====")
    loggerFunction("Error occured in " + name)

    if (from === "axios"){
        loggerFunction(err.response.data);
        loggerFunction(err.response.status);
        loggerFunction(err.response.headers);
    }else if(err.request){

        loggerFunction(err.request);
    }else{
        loggerFunction("Error", err.message);
    }
    loggerFunction(err.toJSON());   

    loggerFunction("====END====")



}

module.exports = errorHandler;