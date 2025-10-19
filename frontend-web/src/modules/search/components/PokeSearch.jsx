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
const ALL_EGG_GROUPS = [
    'Monstruo', 'Planta', 'Bicho', 'Volador', 'Campo', 'Hada', 
    'Humanoide', 'Agua 1', 'Agua 2', 'Agua 3', 'Mineral', 
    'Amorfo', 'Ditto', 'Dragón', 'Desconocido'
];
const ALL_GENERATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const STAT_FIELDS = [
    { key: 'ps', label: 'PS' },
    { key: 'atk', label: 'Ataque' },
    { key: 'df', label: 'Defensa' },
    { key: 'atk_sp', label: 'At. Esp.' },
    { key: 'df_sp', label: 'Def. Esp.' },
    { key: 'vel', label: 'Velocidad' }
];

const PokeSearch = () => {
    const [keywords, setKeywords] = useState('');
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedEggGroups, setSelectedEggGroups] = useState([]);
    const [selectedGens, setSelectedGens] = useState([]);
    const [statFilters, setStatFilters] = useState({
        ps: { min: '', max: '' },
        atk: { min: '', max: '' },
        df: { min: '', max: '' },
        atk_sp: { min: '', max: '' },
        df_sp: { min: '', max: '' },
        vel: { min: '', max: '' }
    });
    const [moveKeyword, setMoveKeyword] = useState('');
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

        // Filtro por tipos (AND)
        if (selectedTypes.length > 0) {
            mustQueries.push({
                bool: {
                    must: selectedTypes.map(type => ({
                        term: { "types": type }
                    }))
                }
            });
        }

        // Filtro por huevos (AND)
        if (selectedEggGroups.length > 0) {
            mustQueries.push({
                bool: {
                    must: selectedEggGroups.map(egg_group => ({
                        term: { "egg_groups": egg_group }
                    }))
                }
            });
        }

        // Filtro por generaciones (OR)
        if (selectedGens.length > 0) {
            mustQueries.push({
                terms: { "gen": selectedGens }
            });
        }

        // Filtros por estadísticas (rango)
        Object.entries(statFilters).forEach(([field, range]) => {
            const conditions = {};
            if (range.min !== '') conditions.gte = Number(range.min);
            if (range.max !== '') conditions.lte = Number(range.max);
            if (Object.keys(conditions).length > 0) {
                mustQueries.push({ range: { [field]: conditions } });
            }
        });

        // Filtro por movimiento
        if (moveKeyword.trim() !== '') {
            mustQueries.push({
                nested: {
                    path: "moves",
                    query: {
                        match_phrase_prefix: {
                            "moves.name": moveKeyword.trim()
                        }
                    }
                }
            });
        }

        const query = {
            from: (page - 1) * PAGE_SIZE,
            size: PAGE_SIZE,
            _source: ['name', 'image_url', 'types', 'number'],
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
    }, [keywords, selectedTypes, selectedEggGroups, selectedGens, statFilters, moveKeyword]);

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

    const toggleEggGroup = eggGroup => {
        setSelectedEggGroups(prev => {
            if (prev.includes(eggGroup)) {
                return prev.filter(e => e !== eggGroup);
            } else if (prev.length < 2) {
                return [...prev, eggGroup];
            } else {
                return prev; // no permitir más de 2
            }
        });
    };

    const toggleGen = gen => {
        setSelectedGens(prev => {
            if (prev.includes(gen)) {
                return prev.filter(g => g !== gen);
            } else {
                return [...prev, gen];
            }
        });
    };

    /*const resetFilters = () => {
        setSelectedTypes([]);
        setSelectedEggGroups([]);
        setSelectedGens([]);
        setStatFilters({
            ps: { min: '', max: '' },
            atk: { min: '', max: '' },
            df: { min: '', max: '' },
            atk_sp: { min: '', max: '' },
            df_sp: { min: '', max: '' },
            vel: { min: '', max: '' }
        });
    };*/

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

                        <p>Filtrar por grupo huevo (máx. 2):</p>
                        <div className="poksearch__egg-groups">
                            {ALL_EGG_GROUPS.map(group => (
                                <button
                                    key={group}
                                    className={`egg-chip ${
                                        selectedEggGroups.includes(group) ? 'selected' : ''
                                    }`}
                                    onClick={() => toggleEggGroup(group)}
                                >
                                    {group}
                                </button>
                            ))}
                        </div>

                        <p>Filtrar por generación:</p>
                        <div className="poksearch__gens">
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

                        <p>Filtrar por estadísticas:</p>
                        <div className="poksearch__stats">
                            {STAT_FIELDS.map(stat => (
                                <div key={stat.key} className="stat-filter">
                                    <label>{stat.label}</label>
                                    <div className="stat-inputs">
                                        <input
                                            type="number"
                                            min="0"
                                            max="255"
                                            placeholder="Mín"
                                            value={statFilters[stat.key].min}
                                            onChange={e =>
                                                setStatFilters(prev => ({
                                                    ...prev,
                                                    [stat.key]: {
                                                        ...prev[stat.key],
                                                        min: e.target.value
                                                    }
                                                }))
                                            }
                                        />
                                        <span>–</span>
                                        <input
                                            type="number"
                                            min="0"
                                            max="255"
                                            placeholder="Máx"
                                            value={statFilters[stat.key].max}
                                            onChange={e =>
                                                setStatFilters(prev => ({
                                                    ...prev,
                                                    [stat.key]: {
                                                        ...prev[stat.key],
                                                        max: e.target.value
                                                    }
                                                }))
                                            }
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <p>Filtrar por movimiento:</p>
                        <div className="poksearch__moves">
                            <input
                                type="text"
                                placeholder="Busca un movimiento (ej: Placaje)"
                                value={moveKeyword}
                                onChange={e => setMoveKeyword(e.target.value)}
                            />
                        </div>

                        {/*(selectedTypes.length > 0 || selectedGens.length > 0) && (
                            <button
                                className="poksearch__reset"
                                onClick={resetFilters}
                            >
                                Reiniciar filtros
                            </button>
                        )*/}
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
