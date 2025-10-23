import { Route, Routes } from 'react-router';

import Home from './Home';
import {PokeSearch, PokeDetails, PokeMoveSearch, PokeItemSearch, PokeAbilitySearch} from '../../search';

import "./Body.css";

const App = () => {

    return (
        <main className="main">
            <Routes>
                <Route path="/" element={<Home/>} />
                <Route path="/pokemon" element={<PokeSearch/>} />
                <Route path="/pokemon/:id" element={<PokeDetails/>} />
                <Route path="/movimientos" element={<PokeMoveSearch/>} />
                <Route path="/habilidades" element={<PokeAbilitySearch/>} />
                <Route path="/objetos" element={<PokeItemSearch/>} />
            </Routes>
        </main>
    )
}

export default App;