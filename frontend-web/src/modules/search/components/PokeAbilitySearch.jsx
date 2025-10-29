import { useState, useEffect } from 'react';
import backend from '../../../backend';
import './PokeAbilitySearch.css';

const ALL_GENERATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const PAGE_SIZE = 18;

const PokeAbilitySearch = () => {
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
                        { match_phrase_prefix: { name: keyword.trim() } },
                        { match_phrase_prefix: { name_english: keyword.trim() } }
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
                match_phrase_prefix: { description: descriptionKeyword.trim() }
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
        
        const response = await backend.elasticSearchService.findAbilities(query);

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
        <div className="abilitysearch">
            <div className="abilitysearch__form">
                <input
                    type="text"
                    placeholder="Busca una habilidad por nombre..."
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                />
            </div>

            <div className="abilitysearch__filters-section">
                <button
                    className="abilitysearch__filters-toggle"
                    onClick={() => setFiltersOpen(!filtersOpen)}
                >
                    Filtros {filtersOpen ? '▲' : '▼'}
                </button>
                <hr />
                {filtersOpen && (
                    <div className="abilitysearch__filters">
                        <p>Filtrar por generación:</p>
                        <div className="abilitysearch__gens">
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
                        <div className="abilitysearch__description">
                            <input
                                type="text"
                                placeholder="Busca una habilidad por descripción..."
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
                    <div className="results-a">
                        {result.map((ability) => {
                            const ab = ability._source;
                            return (
                                <div key={ab.number} className="ability-card">
                                    <div className="ability-header">
                                        <div className="ability-info">
                                            <h3 className="ability-name">{ab.name}</h3>
                                            <h4 className="ability-name-eng">{ab.name_english}</h4>
                                            <span className="ability-gen">Gen {ab.generation}</span>
                                        </div>
                                    </div>

                                    <p className="ability-desc">{ab.description}</p>

                                    <div className="ability-holders">
                                        {ab.single_holders.length > 0 && (
                                            <div className="holder-group">
                                                <span className="holder-label single">Poseedores únicos:</span>
                                                <div className="holder-list">
                                                    {ab.single_holders.map((h, i) => (
                                                        <span key={i} className="holder-name">{h}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {ab.double_holders.length > 0 && (
                                            <div className="holder-group">
                                                <span className="holder-label double">Poseedores dobles:</span>
                                                <div className="holder-list">
                                                    {ab.double_holders.map((h, i) => (
                                                        <span key={i} className="holder-name">{h}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {ab.hidden_holders.length > 0 && (
                                            <div className="holder-group">
                                                <span className="holder-label hidden">Habilidad oculta:</span>
                                                <div className="holder-list">
                                                    {ab.hidden_holders.map((h, i) => (
                                                        <span key={i} className="holder-name">{h}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
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

export default PokeAbilitySearch;