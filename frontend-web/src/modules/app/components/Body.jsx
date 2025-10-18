import { Route, Routes } from 'react-router';

import Home from './Home';
import {PokeSearch} from '../../search';

import "./Body.css";

const App = () => {

    return (
        <main className="main">
            <Routes>
                <Route path="/" element={<Home/>} />
                <Route path="/pokemon" element={<PokeSearch/>} />
                <Route path="/habilidades" element={<PokeSearch/>} />
                <Route path="/movimientos" element={<PokeSearch/>} />
                <Route path="/objetos" element={<PokeSearch/>} />
            </Routes>
        </main>
    )
}

export default App;