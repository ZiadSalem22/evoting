import React from 'react';//getting react  moduel from react node moduel folder
import { render } from 'react-dom';// render is the key of installing react to the front end it allows us to call react into the html document


// here we render a specifc div  (html or xml) code with a specific element id in our document
render(
    <div>E-Voting in React!</div>,
    document.getElementById('root')
);