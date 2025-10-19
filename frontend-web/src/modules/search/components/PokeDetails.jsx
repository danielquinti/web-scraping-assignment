import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import backend from '../../../backend';
import './PokeDetails.css';

const PokemonDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pokemon, setPokemon] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPokemon = async () => {
            setLoading(true);
            const response = await backend.elasticSearchService.findPokemonById(id);
            if (response.ok && response.payload._source) {
                setPokemon(response.payload._source);
            } else {
                setPokemon(null);
            }
            setLoading(false);
        };
        fetchPokemon();
    }, [id]);

    if (loading) return <p className="loading">Cargando Pokémon...</p>;
    if (!pokemon) return <p className="error">No se encontró el Pokémon solicitado.</p>;

    return (
        <div className="pokemon-detail">
            <button className="back-button" onClick={() => navigate(-1)}>
                ← Volver
            </button>

            <div className="pokemon-detail__card">
                <img src={pokemon.image_url} alt={pokemon.name} className="pokemon-image"/>
                <h2>#{pokemon.number} {pokemon.name}</h2>
                <p className="category">{pokemon.category}</p>

                <div className="types">
                    {pokemon.types.map(type => (
                        <span key={type} className={`type ${type.toLowerCase()}`}>{type}</span>
                    ))}
                </div>

                <div className="abilities">
                    <p><strong>Habilidad:</strong> {pokemon.abilities.join(', ') || '—'}</p>
                    <p><strong>Habilidad oculta:</strong> {pokemon.hidden_abilities || '—'}</p>
                </div>

                <div className="gen">Generación: {pokemon.gen}</div>

                <h3>Estadísticas</h3>
                <div className="stats">
                    <div className="stat"><strong>PS</strong> {pokemon.ps}</div>
                    <div className="stat"><strong>Ataque</strong> {pokemon.atk}</div>
                    <div className="stat"><strong>Defensa</strong> {pokemon.df}</div>
                    <div className="stat"><strong>At. Esp.</strong> {pokemon.atk_sp}</div>
                    <div className="stat"><strong>Def. Esp.</strong> {pokemon.df_sp}</div>
                    <div className="stat"><strong>Velocidad</strong> {pokemon.vel}</div>
                </div>

                <h3>Movimientos</h3>
                <div className="pokemon-moves">
                    {pokemon.moves.map(move => (
                        <span key={move.name} className={`move ${move.type.toLowerCase()}`}>
                            {move.name}
                        </span>
                    ))}
                </div>

                <h3>Fortalezas y Debilidades</h3>
                <div className="resistances">
                    <div><strong>Muy débil a (x4):</strong> {pokemon.super_weak.join(' / ') || '—'}</div>
                    <div><strong>Débil a (x2):</strong> {pokemon.weak.join(' / ') || '—'}</div>
                    <div><strong>Neutral a (x1):</strong> {pokemon.normal_damage.join(' / ') || '—'}</div>
                    <div><strong>Resistente a (x0.5):</strong> {pokemon.resistant.join(' / ') || '—'}</div>
                    <div><strong>Muy resistente a (x0.25):</strong> {pokemon.super_resistant.join(' / ') || '—'}</div>
                    <div><strong>Inmune a (x0):</strong> {pokemon.inmunity.join(' / ') || '—'}</div>
                </div>
            </div>
        </div>
    );
};

export default PokemonDetail;
