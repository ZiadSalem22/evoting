import React from 'react';//getting react  module from react node module folder
import { createRoot } from 'react-dom/client';// render is the key of installing react to the front end it allows us to call react into the html document
import { Router, Switch, Route } from 'react-router-dom';
import './index.css';
import Blocks from './pages/Blocks';
import ConductTransaction from './pages/ConductTransaction';
import TransactionPool from './pages/TransactionPool';
import App from './App';

const root = createRoot( document.getElementById('root'));
// here we render a specific div  (html or xml) code with a specific element id in our document
root.render(

    <App />
);