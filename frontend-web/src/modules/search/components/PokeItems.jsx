import { Link } from 'react-router';

import './PokeItems.css';

const PokeItems = ({ items }) => {
    return (
        <div className="pokeitems">
            {items.map(item => {
                const pokemon = item._source;
                return (
                    <Link
                        key={item._id || pokemon.number}
                        to={`/pokemon/${item._id}`}
                        className="pokeitem-card"
                    >
                        <img src={pokemon.image_url} alt={pokemon.name} />
                        <h3>{pokemon.name}</h3>
                        <p>{pokemon.types.join(' / ')}</p>
                        <p className="poke-number">#{pokemon.number}</p>
                    </Link>
                );
            })}
        </div>
    );
};

export default PokeItems;
