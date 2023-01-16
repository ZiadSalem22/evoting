import React from 'react';
// import './App.css';
import { BrowserRouter as Router, Routes, Route,useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Blocks from './components/Blocks';
import ConductTransaction from './components/ConductTransaction';
import TransactionPool from './components/TransactionPool';
import NavBar  from './components/NavBar';

function App() {
        return (
        <Router >
            <NavBar/>
            <Routes >
                <Route path='/' exact element={<Home />} />
                <Route path='/blocks' element={<Blocks />} />
                <Route path='/conduct-transaction' element={<ConductTransaction />} />
                <Route path='/transaction-pool' element={<TransactionPool />}  />
            </Routes>
        </Router>
    );
}

export default App;