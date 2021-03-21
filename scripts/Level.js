'use strict'

export default class Level{
    constructor(error=0, errMsg="No Error"){
        this.object=[];
        error,
        errMsg
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