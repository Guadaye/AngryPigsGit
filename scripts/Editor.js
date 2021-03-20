'use strict';

import Level from "./Level.js"
export default class Editor {


    constructor() {

        //set up fields to hold data
        //the level itself is in the dom
        this.gameObjectList = [];
      
        //this._createLevel();
        this._handleDraggables();
        //Fetch the list of GameObjects
        this._populateGameObjectList()
            .then(gameObjects => {
                //build sidebar with game objects
            })
            .catch(error => { this._showErrorDialogue(error) });

            
        //Fetch the list of levels
            this._populateLevelList();
        /*ideally 
            this.gameObjectList = new GameObjectList();
            this.gameObjectList.populate();    
        */
        //Initialize the draggable stuff...

        // Handle user save events
        $("#level-list").on('submit', event =>{
            event.preventDefault();
            this._loadLevel(event);
        } );

        $("#level-info").on('change', event => this._loadLevel(event));
        $("#info-form").on('submit', event => this._handleSubmitForm(event));
        $("#object-creator").on('submit', event => this._handleObjectSubmitForm(event));
        
    }

    run() { }


    _showErrorDialogue() {
        //TODO, build a dialog system for showing error messages
    }

    _updateLevelList(levelList) {
        //do some fancy jQuery to fill in the level list.
        const $optionList = $('#level-list');
        //
        levelList.foreach(item => {
            let $option = $(`<option value="${item}">${item}</option>`);
            $optionList.addChild($option)
        })
    }

        //Save Level
    _handleSubmitForm(event) {

        event.preventDefault();

        // get form data as JS object
        let request = this._createLevel(event);

        console.log("request"+request);

        // send data to the server....
        $.post("/api/save", request)
        .then(response => {
            let data = response.payload;
            if(!response.error){}
        });
    }

    _createLevel(event){

     let request = $(event.target).serializeArray();
     console.log(request);
     let bodyData={};

     request.forEach(element => {
        bodyData[element.name] = element.value;
    })

        let levelName = bodyData.levelName;
        let thisLevelObject = this._getEditorObject(levelName);

        console.log("thisLevelObject"+thisLevelObject);
        
        let dataToSave = {
            action:1,
            name: levelName,
            obstacles: bodyData.obstacles,
            cannons:bodyData.cannons,
            shots:bodyData.shots,
            type:"level",
            thisLevelObject
        }        
     //return $.param(dataToSave);
     return dataToSave;
    }

    _getEditorObject(levelName){
        let level = new Level(levelName);

       $('#editor-area').find('div').each((index,el)=>{
         
        let dic=
        {
            id:index,
            left:$(el).css("left"),
            top:$(el).css("top"),
            height:$(el).css("height"),
            width:$(el).css("width"),
            image:$(el).css("background-image"),
            objName:$(el).attr("id"),
        }
            level.object.push(dic);
       });

        let levelStr = JSON.stringify(level);
        return levelStr;               
    }

    _populateLevelList() {

        //post a message to the server.
        $.post('/api/get_level_list', { type: 'level' })
            .then(
                theLevelList => {
                
                let fileList =JSON.parse(theLevelList);
                console.log(fileList);

                const parentFileList = fileList.fileList;         

                parentFileList.forEach(level=>{

                   let markup =`<option value="${level.name}">"${level.name}" </option>`;

                    $("#level-list").append(markup);
                });               
        })
    }

        _loadLevel(event) {

            event.preventDefault();
 
            let levelName =$(event.target).serializeArray();;
          //  let name = levelName.value;
        
            let levelNameObject = [];

            levelName.forEach(element => {
                levelNameObject.name = element.value;            
            })       

            $.post('/api/load',{ type: 'level' })
            .then(
                theLevelList => {
                
                let fileList =JSON.parse(theLevelList);
               
                const parentFileList = fileList.fileList;    
        
                let arrayPosition = this._findArrayPosition(parentFileList,levelNameObject.name);           

                let fileInfo = parentFileList[arrayPosition];

                let objectList = fileInfo.thisLevelObject;

                let  objectListObjectArry = JSON.parse(objectList).object;

                console.log(objectListObjectArry);             

                let $markup;
                objectListObjectArry.forEach(object=>{
               
                    $markup +=`<div draggable="true"  style=" height : ${object.height}; width:${object.height}; 
                    background-image:${object.image}; position: relative; left: ${object.left}; top: ${object.top}; "></div>`;
 
                  
                 }); 
                 $("#editor-area").html($markup);
            })

        
          //  ${object.image}
        }

        _findArrayPosition(parentFileList,name)
        {
           let arrayPosition=0;
            while (arrayPosition<parentFileList.length)
            {
                if (parentFileList[arrayPosition].name==name)
                return arrayPosition;
                arrayPosition++;
            }
        }
    
    _populateGameObjectList() {
        return new Promise((resolve, reject) => { //params are functions too
            // do some work async
            $.post('/api/load', { type: 'object' }).
            then(res => {let fileList = JSON.parse(res).fileList;//let returned data become object list again.
                         let objectDomList = "";//add the name of each object into a new list

                         console.log(fileList);
                fileList.forEach(fileItem => {
                    if (fileItem.Shape==="Square")
                    {         // <div name="${fileItem.name}" value="${fileItem.name}">   
                    objectDomList += `                                        
                    <div id= "${fileItem.name}" class = "draggable" draggable="true" style=" position:relative; left:30px; height: ${fileItem.height}px; width: ${fileItem.width}px;
                    background-image: url(${fileItem.Texture}); "></div> <br><br>
                    `    
                    }
                    else if (fileItem.Shape==="Round")
                    {
                    objectDomList += `                                        
                    <div id= "box-one" class = "draggable"  draggable="true" style=" position:relative; left:30px;height: ${fileItem.height}px; width: ${fileItem.width}px;
                    background-image: url(${fileItem.Texture});  border-radius: 50%;"></div> <br><br>
                    `    
                    }
                    else if (fileItem.Shape==="Triangle")
                    {
                    objectDomList += `                                        
                    <div id= "box-one" draggable="true" style=" 
                    position:relative; left:30px;
                     background-image: url(../image/bomb.png);
                     border-left: ${fileItem.height}px solid transparent;
                     border-right: ${fileItem.height}px solid transparent;
                     border-bottom: ${fileItem.width}px solid #999;
                    </div><br><br>
                    `    
                        /*
                    width: ${fileItem.width}px;
                    height: ${fileItem.height}px;
                    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
                    border-bottom-image: url(${fileItem.Texture}); "></div>     
                */
                }                                   
                });

                    $("#object-list").html(objectDomList);

                }).catch(error => {
                    
                })
        })
    }

    //send Object Editor result to server
    _handleObjectSubmitForm(event) {

        event.preventDefault();
        // get form data as JS object
        let request = $(event.target).serializeArray();
        console.log(request);

        let bodyData = {
            type:'object',
        };

        request.forEach(element => {
            bodyData[element.name] = element.value;
        })
        $.post("/api/save", bodyData, this.handleServerResponse)
    };

    _handleDraggables(){
        $('#object-list')
            .on('mouseover',event=>{
                console.log("MouseOver");
            })
            .on('dragstart',event=>{
                
                console.log("DragStart");

                this.$dragTarget = $(event.target);
                let h = this.$dragTarget.css("height");
                let w = this.$dragTarget.css("width");
                let g = this.$dragTarget.css("background-image");

                //get data to transfer
                let transferData={
                    targetId:event.target.id,
                    gameParams:{
                         "height": h,
                         "width":w,
                         "background-image":g,       
                    }
                };
                 //attach transfer data to the event
                event.originalEvent.dataTransfer.setData("text", JSON.stringify(transferData));
                event.originalEvent.dataTransfer.effectAllowed = "move";
                //grab offset
                
                //let offset={};
                this.$dragTarget.x=event.clientX - Math.floor(event.target.offsetLeft);
                this.$dragTarget.y=event.clientY - Math.floor(event.target.offsetTop);

                //old z index
                let z = this.$dragTarget.css("zIndex");
                //let z = event.target.style.zIndex;

              //what todo with zIndex?
                console.log(h);
            })
            .on('mouseout',event=>{
                //change cursor back
            })

        $('#editor-area')
            .on('dragover',event=>{
                event.preventDefault();
            })

            .on('drop',event=>{
                event.preventDefault();

                //update the css for the dragTarget
                let left=`${event.clientX -  this.$dragTarget.x}px`;
                let top = `${event.clientY -  this.$dragTarget.y}px`;
                //this.$dragTarget.css(this._cssFrom(left,top));
                 
                //get embedded transferData
                let rawData = event.originalEvent.dataTransfer.getData("text");
                let transferData= JSON.parse(rawData);
                let $obj = $(`<div id = "${transferData}" class = "draggable" draggable= "true"
                style=" height: ${transferData.gameParams.height}px; width: ${transferData.gameParams.width}px;
                        </div>  `)

                //$("#object-list")[0].innerHTML = objectDomList;
                //attach transferData.gameParams to something?
                //create a new element in the right location
               
                let $el = $(` <div></div>`);
                
           //     $el.css( this._cssFrom(left,top ));
             //   $(`#editor-area`).append( this.$dragTarget.clone() );
          //   $(`#editor-area`).append( $el );
              //  this.$dragTarget.clone().appendTo($el);

              let clone=this.$dragTarget.clone();
              clone.css( this._cssFrom(left,top ));
              $(`#editor-area`).append( clone );
                
            })
    }

    _cssFrom(left,top){
        return{
            position:"absolute",
            margin:"0px",
            left,
            top,
        }
    }
}