import { useState, useEffect } from 'react';
import backend from '../../../backend';
import './PokeMoveSearch.css';

const MOVE_TYPES = [
    'normal','fuego','agua','planta','eléctrico','hielo','lucha','veneno','tierra',
    'volador','psíquico','bicho','roca','fantasma','dragón','siniestro','acero','hada'
];

const MOVE_CLASSES = ['físico','especial','de estado'];
const PAGE_SIZE = 24;

const PokeMoveSearch = () => {
    const [keyword, setKeyword] = useState('');
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedClasses, setSelectedClasses] = useState([]);
    const [damageRange, setDamageRange] = useState({ min: '', max: '' });
    const [precRange, setPrecRange] = useState({ min: '', max: '' });
    const [ppRange, setPpRange] = useState({ min: '', max: '' });
    const [moves, setMoves] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [filtersOpen, setFiltersOpen] = useState(false);

    const fetchMoves = async () => {
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

        // Filtro por tipo (OR)
        if (selectedTypes.length > 0) {
            mustQueries.push({ 
                terms: { 
                    movement_type: selectedTypes 
                } 
            });
        }
        
        // Filtro por tipo de movimiento (OR)
        if (selectedClasses.length > 0) {
            mustQueries.push({ 
                terms: { 
                    movement_class: selectedClasses 
                } 
            });
        }

        const rangeFields = [
            { field: 'movement_damage', range: damageRange },
            { field: 'movement_precission', range: precRange },
            { field: 'movement_power_points', range: ppRange }
        ];

        rangeFields.forEach(r => {
            const cond = {};
            if (r.range.min !== '') cond.gte = Number(r.range.min);
            if (r.range.max !== '') cond.lte = Number(r.range.max);
            if (Object.keys(cond).length > 0) {
                mustQueries.push({ range: { [r.field]: cond } });
            }
        });

        const query = {
            from: (page - 1) * PAGE_SIZE,
            size: PAGE_SIZE,
            query: 
                mustQueries.length > 0
                    ? { bool: { must: mustQueries } } 
                    : { match_all: {} }
        };

        const response = await backend.elasticSearchService.findMoves(query);

        if (response.ok) {
            setMoves(response.payload.hits.hits);
            const totalHits = response.payload.hits.total.value || 0;
            setTotalPages(Math.ceil(totalHits / PAGE_SIZE));
        } else {
            setMoves([]);
            setTotalPages(1);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchMoves();
        setPage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keyword, selectedTypes, selectedClasses, damageRange, precRange, ppRange]);

    useEffect(() => {
        fetchMoves();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const toggleType = (type) =>
        setSelectedTypes(prev =>
            prev.includes(type) 
                ? prev.filter(t => t !== type) 
                : [...prev, type]
        );

    const toggleClass = (cls) =>
        setSelectedClasses(prev =>
            prev.includes(cls) 
                ? prev.filter(c => c !== cls) 
                : [...prev, cls]
        );

    return (
        <div className="movsearch">
            <div className="movsearch__form">
                <input
                    type="text"
                    placeholder="Busca un movimiento por nombre..."
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                />
            </div>

            <div  className="movsearch__filters-section">
                <button
                    className="movsearch__filters-toggle"
                    onClick={() => setFiltersOpen(!filtersOpen)}
                >
                    Filtros {filtersOpen ? '▲' : '▼'}
                </button>
                <hr />
                {filtersOpen && (
                    <div className="movsearch__filters">
                        <p>Filtrar por tipo:</p>
                        <div className="movsearch__types">
                            {MOVE_TYPES.map(t => (
                                <button
                                    key={t}
                                    className={`type-chip ${
                                        selectedTypes.includes(t)
                                            ? 'selected'
                                            : ''
                                    }`}
                                    onClick={() => toggleType(t)}
                                >
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                </button>
                            ))}
                        </div>

                        <p>Filtrar por clase:</p>
                        <div className="movsearch__class">
                            {MOVE_CLASSES.map(c => (
                                <button
                                    key={c}
                                    className={`class-chip ${
                                        selectedClasses.includes(c)
                                            ? 'selected'
                                            : ''
                                    }`}
                                    onClick={() => toggleClass(c)}
                                >
                                    {c.charAt(0).toUpperCase() + c.slice(1)}
                                </button>
                            ))}
                        </div>

                        <p>Filtrar por estadísticas:</p>
                        <div className="movsearch__stats">
                            <div className="stat-filter">
                                <label>Potencia:</label>
                                <div className="stat-inputs">
                                    <input
                                        type="number"
                                        placeholder="Mín"
                                        value={damageRange.min}
                                        onChange={e => 
                                            setDamageRange({ 
                                                ...damageRange, 
                                                min: e.target.value 
                                            })
                                        }
                                    />
                                    <span>–</span>
                                    <input
                                        type="number"
                                        placeholder="Máx"
                                        value={damageRange.max}
                                        onChange={e => 
                                            setDamageRange({ 
                                                ...damageRange, 
                                                max: e.target.value 
                                            })
                                        }
                                    />
                                </div>
                            </div>
                            <div className="stat-filter">
                                <label>Precisión:</label>
                                <div className="stat-inputs">
                                    <input
                                        type="number"
                                        placeholder="Mín"
                                        value={precRange.min}
                                        onChange={e => 
                                            setPrecRange({ 
                                                ...precRange, 
                                                min: e.target.value 
                                            })
                                        }
                                    />
                                    <span>–</span>
                                    <input
                                        type="number"
                                        placeholder="Máx"
                                        value={precRange.max}
                                        onChange={e => 
                                            setPrecRange({ 
                                                ...precRange, 
                                                max: e.target.value 
                                            })
                                        }
                                    />
                                </div>
                            </div>
                            <div className="stat-filter">
                                <label>PP:</label>
                                <div className="stat-inputs">
                                    <input
                                        type="number"
                                        placeholder="Mín"
                                        value={ppRange.min}
                                        onChange={e => 
                                            setPpRange({ 
                                                ...ppRange, 
                                                min: e.target.value 
                                            })
                                        }
                                    />
                                    <span>–</span>
                                    <input
                                        type="number"
                                        placeholder="Máx"
                                        value={ppRange.max}
                                        onChange={e => 
                                            setPpRange({ 
                                                ...ppRange, 
                                                max: e.target.value 
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {loading ? (
                <p>Cargando...</p>
            ) : moves.length === 0 ? (
                <p>No se encontraron movimientos.</p>
            ) : (
                <>
                    <div  className="results">
                        {moves.map(item => {
                            const move = item._source;
                            return (
                                <div key={item._id || move.number} className={`move-card ${move.movement_type}`}>
                                    <h3>{move.name} // {move.name_english}</h3>
                                    <div className="move-header">
                                        <span className={`type-badge ${move.movement_type}`}>{move.movement_type}</span>
                                        <span className={`class-badge ${move.movement_class.replace(/\s/g,'-')}`}>{move.movement_class}</span>
                                    </div>
                                    <div className="move-stats">
                                        <span>Pot: {move.movement_damage ?? '—'}</span>
                                        <span>Prec: {move.movement_precission ?? '—'}</span>
                                        <span>PP: {move.movement_power_points ?? '—'}</span>
                                    </div>
                                    <p className="description">{move.description}</p>
                                </div>
                            );
                        })
                        }
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
};

export default PokeMoveSearch;
