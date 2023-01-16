import React from 'react';
// import './App.css';
// import Navbar from './components/Navbar';
import { BrowserRouter as Router, Routes, Route,useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Blocks from './components/Blocks';
import ConductTransaction from './components/ConductTransaction';
import TransactionPool from './components/TransactionPool';

function App() {
        return (
        <div>
        <Router >
            <div> Hello</div>
            {/* <Navbar /> */}
            <Routes >
                <Route path='/' exact element={<Home />} />
                <Route path='/blocks' element={<Blocks />} />
                <Route path='/conduct-transaction' element={<ConductTransaction />} />
                <Route path='/transaction-pool' element={<TransactionPool />}  />
            </Routes>
        </Router>
        </div>
    );
}

export default App;