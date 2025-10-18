import { useState, useEffect } from 'react';
import backend from '../../../backend';
import PokeItems from './PokeItems';
import './PokeSearch.css';

const PAGE_SIZE = 21;

const PokeSearch = () => {
    const [keywords, setKeywords] = useState('');
    const [result, setResult] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [filtersOpen, setFiltersOpen] = useState(false);

    const fetchPokemons = async () => {
        setLoading(true);

        const query = {
            from: (page - 1) * PAGE_SIZE,
            size: PAGE_SIZE,
            query: keywords.trim() === ''
                ? { match_all: {} }
                : { match_phrase_prefix: { name: keywords.trim() } }
        };


        try {
            const response = await backend.elasticSearchService.findPokemons(query);

            if (response.ok && response.payload.hits) {
                setResult(response.payload.hits.hits);
                const totalHits = response.payload.hits.total.value || 0;
                setTotalPages(Math.ceil(totalHits / PAGE_SIZE));
            } else {
                setResult([]);
                setTotalPages(1);
            }
        } catch (error) {
            console.error(error);
            setResult([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPokemons();
        setPage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keywords]);

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
                        <p>Filtros por tipo, generación, habilidades...</p>
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
