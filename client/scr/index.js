import React from 'react';//getting react  module from react node module folder
import { render } from 'react-dom';// render is the key of installing react to the front end it allows us to call react into the html document
import { Router, Switch, Route } from 'react-router-dom';
import history from './history';
import App from './components/App';
import './index.css';
import Blocks from './components/Blocks';
import ConductTransaction from './components/ConductTransaction';
import TransactionPool from './components/TransactionPool';

// here we render a specific div  (html or xml) code with a specific element id in our document
render(
    <Router history={history}>
        <Switch>
            <Route  exact={true} path='/' component={App}/>
            <Route  path='/blocks' component={Blocks}/>
            <Route  path='/conduct-transaction' component={ConductTransaction}/>
            <Route  path='/transaction-pool' component={TransactionPool}/>
        </Switch>
    </Router>,
    document.getElementById('root')
);