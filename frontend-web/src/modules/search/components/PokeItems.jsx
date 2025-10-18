import './PokeItems.css';

const PokeItems = ({ items }) => {
    return (
        <div className="pokeitems">
            {items.map(item => {
                const pokemon = item._source; // acceder a los datos reales
                return (
                    <div key={item._id || pokemon.number} className="pokeitem-card">
                        <img src={pokemon.image_url} alt={pokemon.name} />
                        <h3>{pokemon.name}</h3>
                        <p>{pokemon.types.join(' / ')}</p>
                        <p className="poke-number">#{pokemon.number}</p>
                    </div>
                );
            })}
        </div>
    );
};

export default PokeItems;
