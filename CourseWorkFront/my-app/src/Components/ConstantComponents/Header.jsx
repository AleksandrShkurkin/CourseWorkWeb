import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../../App';
import styles from '../CSSModules/Header.module.css';

const Header = () => {
    const { setId, isAdmin, setIsAdmin } = useContext(UserContext);

    return (
        <header className={styles.header}>
            <div className={styles.logo}>
                <h1>Music Instruments Shop</h1>
            </div>
            <nav className={styles.nav}>
                <Link to="/" className={styles.link}>
                    Home
                </Link> /
                <Link to="/cart" className={styles.link}>
                    Cart
                </Link>
                {isAdmin ? ( <> /
                    <Link to="/admin/users" className={styles.link}>
                        Admin
                    </Link>
                    </>
                ) : (
                    <></>
                )}
                <button onClick={() => {setId(null); setIsAdmin(false)}} className={styles.logoutButton}>
                    Logout
                </button>
            </nav>
        </header>
    );
};

export default Header;