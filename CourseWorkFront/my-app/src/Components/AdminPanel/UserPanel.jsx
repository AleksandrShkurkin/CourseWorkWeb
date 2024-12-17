import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../App";
import Header from '../ConstantComponents/Header';
import Footer from '../ConstantComponents/Footer';
import RouteHeader from "./RouteHeader";
import { useNavigate } from "react-router-dom";
import styles from "../CSSModules/UserPanel.module.css";

const UserPanel = () => {
    const { id } = useContext(UserContext);
    const [users, setUsers] = useState([]);

    let navigate = useNavigate();

    const fetchUsers = async () => {
        const response = await fetch(`http://localhost:5043/api/User/allUsers`);
        const data = await response.json();
        setUsers(data);
    }

    const removeItem = async (userId, itemId) => {
        try {
            const response = await fetch(
                `http://localhost:5043/api/User/${userId}/cart/${itemId}`,
                { method: "DELETE" }
            );
            if (response.ok) {
                await response.json();
                fetchUsers();
            } else {
                alert("Failed to remove item.");
            }
        } catch (error) {
            console.error("Error removing an item:", error);
        }
    }

    const removeAll = async (userId) => {
        try {
            const response = await fetch(
                `http://localhost:5043/api/User/${userId}/cart/clean`,
                { method: "DELETE" }
            );
            if (response.ok) {
                await response.json();
                alert("Cleaned successfully!")
                fetchUsers();
            } else {
                alert("Failed to remove item.");
            }
        } catch (error) {
            console.error("Error removing an item:", error);
        }
    }

    const deleteUser = async (userId) => {
        if (userId != id) {
            try {
                const response = await fetch(
                    `http://localhost:5043/api/User/${userId}/delete`,
                    { method: "DELETE" }
                );
                if (response.ok) {
                    await response.json();
                    console.log("something")
                    fetchUsers();
                } else {
                    alert("Failed to delete user.");
                }
            } catch (error) {
                console.error("Error deleting user:", error);
            }
        }
    }

    useEffect(() => {
        if (!id) {
            navigate("/register");
        }

        if (id) {
            fetchUsers();
        }
    }, [id, navigate])


    return (
        <>
            <Header />
            <RouteHeader />
            <div className={styles.panelContainer}>
                {users.map((user) => (
                    <div className={styles.userCard} key={user.id}>
                        <div className={styles.userInfo}>
                            <p>
                                <strong>Id:</strong> {user.id}
                            </p>
                            <p>
                                <strong>Name:</strong> {user.userName}
                            </p>
                            <p>
                                <strong>Email:</strong> {user.email}
                            </p>
                            <p>
                                <strong>Admin:</strong> {user.isAdmin ? "Yes" : "No"}
                            </p>
                        </div>
                        <div className={styles.shoppingCart}>
                            {user.shoppingCart.length > 0 ? (
                                user.shoppingCart.map((item) => (
                                    <div className={styles.cartItem} key={item.id}>
                                        <p>
                                            <strong>Id:</strong> {item.id}
                                        </p>
                                        <p>
                                            <strong>Name:</strong> {item.instrumentName}
                                        </p>
                                        <p>
                                            <strong>Brand:</strong> {item.instrumentBrand}
                                        </p>
                                        <p>
                                            <strong>Quanity:</strong> {item.quantity}
                                        </p>
                                        <p>
                                            <strong>Price:</strong> {item.price}$
                                        </p>
                                        <button
                                            className={styles.removeItemButton}
                                            onClick={() => removeItem(user.id, item.id)}
                                        >
                                            Remove Item
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p>No items in the cart.</p>
                            )}
                        </div>
                        <div className={styles.buttonGroup}>
                            <button
                                className={styles.cleanCartButton}
                                onClick={() => removeAll(user.id)}
                            >
                                Clean Shopping List
                            </button>
                            <button
                                className={styles.deleteUserButton}
                                onClick={() => deleteUser(user.id)}
                            >
                                Delete User
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <Footer />
        </>
    );
}

export default UserPanel;