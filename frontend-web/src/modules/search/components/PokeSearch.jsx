import { useState, useEffect } from 'react';
import backend from '../../../backend';
import PokeItems from './PokeItems';
import './PokeSearch.css';

const PAGE_SIZE = 21;
const ALL_TYPES = [
    'Normal', 'Planta', 'Agua', 'Fuego', 'Eléctrico', 'Tierra', 'Roca',
    'Lucha', 'Fantasma', 'Psíquico', 'Siniestro', 'Veneno', 'Bicho', 'Volador',
    'Hielo', 'Acero', 'Dragón', 'Hada'
];

const PokeSearch = () => {
    const [keywords, setKeywords] = useState('');
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [result, setResult] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [filtersOpen, setFiltersOpen] = useState(false);

    const fetchPokemons = async () => {
        setLoading(true);

        const mustQueries = [];

       // Búsqueda por nombre
        if (keywords.trim() !== '') {
            mustQueries.push({
                match_phrase_prefix: { name: keywords.trim() }
            });
        }

        // Filtro por tipos (modo AND)
        if (selectedTypes.length > 0) {
            selectedTypes.forEach(type => {
                mustQueries.push({
                    term: { "types.keyword": type }
                });
            });
        }

        const query = {
            from: (page - 1) * PAGE_SIZE,
            size: PAGE_SIZE,
            query:
                mustQueries.length > 0
                    ? { bool: { must: mustQueries } }
                    : { match_all: {} }
        };

        const response = await backend.elasticSearchService.findPokemons(query);

        if (response.ok) {
            setResult(response.payload.hits.hits);
            const totalHits = response.payload.hits.total.value || 0;
            setTotalPages(Math.ceil(totalHits / PAGE_SIZE));
        } else {
            setResult([]);
            setTotalPages(1);
        }

        setLoading(false);

    };

    useEffect(() => {
        fetchPokemons();
        setPage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keywords, selectedTypes]);

    useEffect(() => {
        fetchPokemons();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const handleSearchChange = e => {
        setKeywords(e.target.value);
    };

    const handlePageChange = newPage => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    const toggleType = type => {
        setSelectedTypes(prev => {
            if (prev.includes(type)) {
                return prev.filter(t => t !== type);
            } else if (prev.length < 2) {
                return [...prev, type];
            } else {
                return prev; // no permitir más de 2
            }
        });
    };

    return (
        <div className="poksearch">
            <div className="poksearch__form">
                <input
                    type="text"
                    placeholder="Busca un Pokémon por nombre..."
                    value={keywords}
                    onChange={handleSearchChange}
                />
            </div>

            <div className="poksearch__filters-section">
                <button
                    className="poksearch__filters-toggle"
                    onClick={() => setFiltersOpen(!filtersOpen)}
                >
                    Filtros {filtersOpen ? '▲' : '▼'}
                </button>
                <hr />
                {filtersOpen && (
                    <div className="poksearch__filters">
                        <p>Filtrar por tipo (máx. 2):</p>
                        <div className="poksearch__types">
                            {ALL_TYPES.map(type => (
                                <button
                                    key={type}
                                    className={`type-chip ${
                                        selectedTypes.includes(type)
                                            ? 'selected'
                                            : ''
                                    }`}
                                    onClick={() => toggleType(type)}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="poksearch__results">
                {loading ? (
                    <p>Cargando Pokémon...</p>
                ) : result.length === 0 ? (
                    <p>No se encontraron Pokémon que coincidan.</p>
                ) : (
                    <>
                        <PokeItems items={result} />
                        <div className="poksearch__pagination">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                            >
                                Anterior
                            </button>
                            <span>
                                Página {page} de {totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === totalPages}
                            >
                                Siguiente
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PokeSearch;
