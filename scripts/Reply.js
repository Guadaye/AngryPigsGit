'use strict';

export default class Reply{

constructor(error=0, errMsg="No Error"){

    this.__private__={
        name:"",
        bytes:0,
        object:{},
        Payload:{},
        error,
        errMsg

    }
/*
    {
        "userid": "valid vfs username", // eg pg15student
        "name": "filename", // name of entity, no spaces, no extension
        "type": "object" | "level", // one of these two key strings

        //I feel like this is what the editor should send to the server?
    }
    */
}

set Payload(value){
    let my = this.__private__;
    my.payload=value;
}


ok(){
    let my = this.__private__;
    my.error = 0;
    my.errMsg = "No Error";
    return this
}

error(code = 0, msg="No Error"){
    let my=this.__private__;
    my.error=code;
    my.errMsg=msg;
    return this

}

serialize(){

    return JSON.stringify(this.__private__)
}

}