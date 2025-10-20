import { Route, Routes } from 'react-router';

import Home from './Home';
import {PokeSearch, PokeDetails, PokeMoveSearch} from '../../search';

import "./Body.css";

const App = () => {

    return (
        <main className="main">
            <Routes>
                <Route path="/" element={<Home/>} />
                <Route path="/pokemon" element={<PokeSearch/>} />
                <Route path="/pokemon/:id" element={<PokeDetails/>} />
                <Route path="/movimientos" element={<PokeMoveSearch/>} />
                <Route path="/habilidades" element={<PokeSearch/>} />
                <Route path="/objetos" element={<PokeSearch/>} />
            </Routes>
        </main>
    )
}

export default App;