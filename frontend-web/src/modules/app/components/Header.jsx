import { NavLink } from "react-router";
import "./Header.css";

const Header = () => {
    const links = [
        { name: "Inicio", path: "/" },
        { name: "Pokemon", path: "/pokemon" },
        { name: "Movimientos", path: "/movimientos" },
        { name: "Habilidades", path: "/habilidades" },
        { name: "Objetos", path: "/objetos" },
    ];

  return (
    <header className="header">
        <div className="header__logo">DEXTER</div>
        <nav className="header__nav">
            {links.map((link) => (
            <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                `header__link ${isActive ? "active" : ""}`
                }
            >
                {link.name}
            </NavLink>
            ))}
        </nav>
    </header>
  );
}

export default Header;
