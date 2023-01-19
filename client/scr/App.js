import React from 'react';
import { BrowserRouter as Router, Routes, Route,useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Blocks from './pages/Blocks';
import ConductTransaction from './pages/ConductTransaction';
import TransactionPool from './pages/TransactionPool';
import NavBar  from './components/NavBar';
import ConductPoll from './pages/ConductPoll';


function App() {
        return (
        <Router >
            <NavBar/>
            <Routes >
                <Route path='/' exact element={<Home />} />
                <Route path='/blocks' element={<Blocks />} />
                <Route path='/conduct-poll' element={<ConductPoll />} />
                <Route path='/conduct-transaction' element={<ConductTransaction />} />
                <Route path='/transaction-pool' element={<TransactionPool />}  />
            </Routes>
        </Router>
    );
}

export default App;