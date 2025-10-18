import "./Home.css";

const Home = () => {
    return (
        <section className="home">
            <div className="home__content">
                <h1 className="home__title">
                    Bienvenido a <span>Dexter</span>
                </h1>
                <p className="home__subtitle">
                    Tu plataforma de consulta Pokemon.
                </p>
            </div>
        </section>
    );
}

export default Home;