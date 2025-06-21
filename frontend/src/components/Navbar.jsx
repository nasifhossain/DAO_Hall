import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const Navbar = ({ address }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      setIsLoggedIn(true);
      try {
        const user = JSON.parse(userStr);
        setIsAdmin(user.isAdmin || false);
        setUsername(user.name || "");
      } catch (err) {
        console.error("Invalid user in localStorage");
      }
    } else {
      setIsLoggedIn(false);
      setUsername("");
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname === path
      ? "text-purple-400 font-semibold"
      : "hover:text-purple-400";

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-purple-400">
          🏛️ HallChain
        </Link>

        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>

        <ul
          className={`md:flex gap-6 ${
            menuOpen ? "block" : "hidden"
          } md:block mt-4 md:mt-0`}
        >
          <li>
            <Link to="/" className={isActive("/")}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/proposals" className={isActive("/proposals")}>
              Proposals
            </Link>
          </li>

          {isAdmin && (
            <>
              <li>
                <Link to="/create" className={isActive("/create")}>
                  Create Proposal
                </Link>
              </li>
              <li>
                <Link to="/requests" className={isActive("/requests")}>
                  Voter Requests
                </Link>
              </li>
              <li>
                <Link to="/add-voter" className={isActive("/add-voter")}>
                  Add Voter
                </Link>
              </li>
              <li>
                <Link to="/transfer" className={isActive("/transfer")}>
                  TransferAdmin
                </Link>
              </li>
            </>
          )}

          {isLoggedIn && username.trim() ? (
            <>
              <li>
                <Link to="/profile" className={isActive("/profile")}>
                  {username}
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-300"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className={isActive("/login")}>
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className={isActive("/register")}>
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
