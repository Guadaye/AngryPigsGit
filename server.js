'use strict'

import fsExtra from 'fs-extra'
import Express from 'express'
import Path, { dirname, format } from 'path'
const __dirname = Path.resolve();//give a current file 
import HTTP from 'http'
import { readdirSync, readFileSync } from 'fs';
import Reply from './scripts/Reply.js'
import FileSystem from 'fs-extra'
import { Console } from 'console';

//3000 PORT don't conflict.
const PORT = 3000;

class Server {

    constructor() {
        //initialize express and its sub components
        //   fsExtra.readJson('./ServerFile/Objects/object-1.json',(err,packageObj)=>{                 
        //      if(err)console.error(err)
        //      console.log(packageObj.version)
        //  })

       
        this.title = "Angry Pigs"
        this.api = Express();
        this.api.use(Express.json())
            .use(Express.urlencoded({ extended: false }))//how images are encoded 
            .use(Express.static(Path.join(__dirname, '.')));//

        //get home page(index.html)
        //get stuff back from server, html send it.

        this.api.get('/editor', (request, response) => {
            response.sendFile(__dirname + '/editor.html', { title: 'form Demo' });
            //take the response object , get the index
        });

        this.api.post('/api/get_level_list', (request, response) => {
           
            let dirName = './ServerFile/Level';
            let fileList = []               
            FileSystem.readdir(dirName) 
            .then(fileNames => {
                fileNames.forEach(fileName => { // go through all the file name
               let filePath = dirName + "/" + fileName
               let fileItem = readFileSync(filePath) // read the file 
               let rawFile = String(fileItem) //turn them into string
               let file = JSON.parse(rawFile) //make them back to be object
               fileList.push(file) // add to the file list
               console.log('mytag fileList',fileList);                
               })

               let resBody = {
                   error: 0,
                   fileList
               }
                 response.send(JSON.stringify(resBody));      //send it back.            
            }) 
                     
        });

        
        // SEND the object list back to client
        this.api.post('/api/load', (request, response) => {
            let type = request.body;


            let dirName = './ServerFile';

            if (type.type=='object')
            dirName += '/Objects';
            if (type.type=='level')
             dirName += '/Level';
            // console.log('mytag readdir',readdir);
            let fileList = []    
            //   const fileNames = readdir(dirName) 
            FileSystem.readdir(dirName) 
             .then(fileNames => {
                 fileNames.forEach(fileName => { // go through all the file name
                let filePath = dirName + "/" + fileName
                let fileItem = readFileSync(filePath) // read the file 
                let rawFile = String(fileItem) //turn them into string
                let file = JSON.parse(rawFile) //make them back to be object
                fileList.push(file) // add to the file list
                console.log('mytag fileList',fileList);                
                })

                let resBody = {
                    error: 0,
                    fileList
                }
                 response.send(JSON.stringify(resBody));      //send it back.            
            })          
        });

        //send data to client
        this.api.post('/api/loadTest1',(request,response)=>{
            let parameters=request.body;
       /*     {
                "userid": "valid vfs username", // eg pg15student
                "name": "filename", // name of entity, no spaces, no extension
                "type": "object" | "level", // one of these two key strings
            }
        */
            let reply=new Reply(1,"Don't use data");

            //open some file, the name is in parameters
            let folder = "./ServerFile/Objects";
            if (parameters.type =="object")
            folder+="/library";

            FileSystem.readFile(`${folder}/${parameters.name}.json`,'utf8')
            .then(fileData=>{
                //if data is ok, add to reply
                reply.payload = fileData;
            })
            .catch(err=>{
                reply.error(1,"No data")
            });
            response.send(reply.ok().serialize())
        })

      
        //SAVE the objects created to server
        this.api.post('/api/save', (request, response) => {

            let data = request.body;    //data attached as a jason structure
       
            let objectName = data.name
           
            if (!objectName) {
                let result = {
                    error: 1,
                    msg: "file name is null"
                }
                response.send(JSON.stringify(result));
            }

            let folder="./ServerFile";
            if (data.type =="object")
            folder +="/Objects/";
            else if (data.type =="level")
            folder +="/Level/";

            var fileAddress = `${folder}${objectName}.json`;
            fsExtra.writeJson(fileAddress, data, err => {
                if (err) return console.error(err)
                console.log('success!')
            })

            //add data to the game object list
            let result = {
                error: 0,
            }
            response.send(JSON.stringify(result));
        });

        this.run();
    }

    run() {
        this.api.set('port', PORT);  //set port
        this.listener = HTTP.createServer(this.api); //set http server, use node object for all the parameters
        this.listener.listen(PORT);//tell it start to listen


        //test, when it start listening, pop a msg of ip address,give a string back, 
        this.listener.on('listening', event => {
            let addr = this.listener.address();

            //it is a if statement. if the type of address is a string, return pipe string, else return port string 
            let bind = ((typeof addr === 'string') ? `pipe ${addr}` : `port ${addr.port}`);
            console.log(`Listening on ${bind}`);
        })
    }

/* 
            // SEND the object back to client
            this.api.post('/api/get_object', (request, response) => {
                let objectList;
                fsExtra.readdir('./ServerFile/Objects', (err, packageObj) => {
                    if (err) console.error(err)
                    console.log(packageObj.version)
                    objectList = packageObj;
    
                    response.send(JSON.stringify(objectList));
                })
            });
*/
}


const server = new Server();

