import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../CSSModules/RouteHeader.module.css';

const RouteHeader = () => {
    return (
        <div className={styles.routeHeader}>
            <nav className={styles.breadcrumbs}>
                <Link to="/admin/users" className={styles.link}>Users</Link>
                <span className={styles.separator}>/</span>
                <Link to="/admin/instruments" className={styles.link}>Instruments</Link>
            </nav>
        </div>
    );
}

export default RouteHeader;