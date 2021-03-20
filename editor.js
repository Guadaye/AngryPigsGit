
'use strict'

import Editor from './scripts/Editor.js';

//Main

(function Main() { //use function so can attach Main, and execute it right away

$(document).ready(event =>{

    const app= new Editor();
    app.run();


})


})()//execute right away