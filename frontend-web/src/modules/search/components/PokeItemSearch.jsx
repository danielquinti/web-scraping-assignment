import { useState, useEffect } from 'react';
import backend from '../../../backend';
import './PokeItemSearch.css';

const ALL_GENERATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const PAGE_SIZE = 25;

const PokeItemSearch = () => {
    const [keyword, setKeyword] = useState('');
    const [selectedGens, setSelectedGens] = useState([]);
    const [descriptionKeyword, setDescriptionKeyword] = useState('');
    const [result, setResult] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [filtersOpen, setFiltersOpen] = useState(false);

    const fetchItems = async () => {
        setLoading(true);

        const mustQueries = [];

        // Búsqueda por nombre
        if (keyword.trim() !== '') {
            mustQueries.push({
                bool: {
                    should: [
                        { match: { name: {
                            query: keyword.trim(),
                            operator: "and",
                        } } },
                        { match: { name_english: {
                            query: keyword.trim(),
                            operator: "and",
                        } } }
                    ]
                }
            });
        }

        // Filtro por generaciones (OR)
        if (selectedGens.length > 0) {
            mustQueries.push({
                terms: { "generation": selectedGens }
            });
        }

        // Búsqueda por descripcion
        if (descriptionKeyword.trim() !== '') {
            mustQueries.push({
                match: { description: {
                    query: descriptionKeyword.trim(),
                    operator: "and",
                } }
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
        
        const response = await backend.elasticSearchService.findItems(query);

        if (response.ok) {
            setResult(response.payload.hits.hits);
            const totalHits = response.payload.hits.total.value || 0;
            setTotalPages(Math.ceil(totalHits / PAGE_SIZE));
        } else {
            setResult([]);
            setTotalPages(1);
        }

        setLoading(false);
    }

    useEffect(() => {
        fetchItems();
        setPage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keyword, selectedGens, descriptionKeyword])

    useEffect(() => {
        fetchItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page])

    const toggleGen = gen => {
        setSelectedGens(prev => {
            if (prev.includes(gen)) {
                return prev.filter(g => g !== gen);
            } else {
                return [...prev, gen];
            }
        });
    };


    return (
        <div className="itemsearch">
            <div className="itemsearch__form">
                <input
                    type="text"
                    placeholder="Busca un objeto por nombre..."
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                />
            </div>

            <div className="itemsearch__filters-section">
                <button
                    className="itemsearch__filters-toggle"
                    onClick={() => setFiltersOpen(!filtersOpen)}
                >
                    Filtros {filtersOpen ? '▲' : '▼'}
                </button>
                <hr />
                {filtersOpen && (
                    <div className="itemsearch__filters">
                        <p>Filtrar por generación:</p>
                        <div className="itemsearch__gens">
                            {ALL_GENERATIONS.map(gen => (
                                <button
                                    key={gen}
                                    className={`gen-chip ${
                                        selectedGens.includes(gen)
                                            ? 'selected'
                                            : ''
                                    }`}
                                    onClick={() => toggleGen(gen)}
                                >
                                    Gen {gen}
                                </button>
                            ))}
                        </div>

                        <p>Filtrar por descripción:</p>
                        <div className="itemsearch__description">
                            <input
                                type="text"
                                placeholder="Busca un objeto por descripción..."
                                value={descriptionKeyword}
                                onChange={e => setDescriptionKeyword(e.target.value)}
                            />
                        </div>
                    </div>
                )}
            </div>

            {loading ? (
                <p>Cargando...</p>
            ) : result.length === 0 ? (
                <p>No se encontraron objetos.</p>
            ) : (
                <>
                    <div className="results-i">
                        {result.map((item, index) => {
                            const objet = item._source;                        
                            return (
                                <div key={index} className="item-card">
                                    <div className="item-header">
                                        <img
                                            src={objet.image_url}
                                            alt={objet.name}
                                            className="item-image"
                                        />
                                        <div className="item-titles">
                                            <h3 className="item-name">{objet.name}</h3>
                                            <h4 className="item-name-eng">{objet.name_english}</h4>
                                            <span className="item-gen">Gen {objet.generation}</span>
                                        </div>
                                    </div>

                                    <p className="item-desc">{objet.description}</p>
                                </div>
                            );
                        })}
                    </div>

                    <div className="pagination">
                        <button
                            onClick={() => setPage(p => Math.max(p - 1, 1))}
                            disabled={page === 1}
                        >
                            Anterior
                        </button>
                        <span>Página {page} de {totalPages}</span>
                        <button
                            onClick={() => setPage(p => Math.min(p + 1, totalPages))} 
                            disabled={page === totalPages}
                        >
                            Siguiente
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default PokeItemSearch;