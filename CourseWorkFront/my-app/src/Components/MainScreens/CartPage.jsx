import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../App";
import Header from '../ConstantComponents/Header';
import Footer from '../ConstantComponents/Footer';
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import styles from "../CSSModules/CartPage.module.css";

const CartPage = () => {
    const { id } = useContext(UserContext);
    const [currentUser, setCurrentUser] = useState("");
    const [selectedItems, setSelectedItems] = useState([]);

    let navigate = useNavigate();

    const fetchCart = async () => {
        try {
            const response = await fetch(
                `http://localhost:5043/api/User/${id}/cart/get`
            );
            if (response.ok) {
                const data = await response.json();
                setSelectedItems(data);
            } else {
                alert("Failed to get user cart.");
            }
        } catch (error) {
            console.error("Error fetching user cart:", error);
        }
    }

    const removeItem = async (itemId, deleteAllMode) => {
        if (deleteAllMode === true) {
            try {
                const response = await fetch(
                    `http://localhost:5043/api/User/${id}/cart/${itemId}`,
                    { method: "DELETE" }
                );
                if (response.ok) {
                    await response.json();
                    fetchCart();
                } else {
                    alert("Failed to remove item.");
                }
            } catch (error) {
                console.error("Error removing an item:", error);
            }
        }
        else {
            try {
                const response = await fetch(
                    `http://localhost:5043/api/User/${id}/cart/${itemId}/all`,
                    { method: "DELETE" }
                );
                if (response.ok) {
                    await response.json();
                    fetchCart();
                } else {
                    alert("Failed to fully remove item.");
                }
            } catch (error) {
                console.error("Error fully removing an item:", error);
            }
        }
    }

    const removeAll = async(buy) => {
        try {
            const response = await fetch(
                `http://localhost:5043/api/User/${id}/cart/clean`,
                { method: "DELETE" }
            );
            if (response.ok) {
                await response.json();
                if (buy === true)
                {
                    alert("Bought successfully!")
                }
                else
                {
                    alert("Cleaned successfully!")
                }
                fetchCart();
            } else {
                alert("Failed to remove item.");
            }
        } catch (error) {
            console.error("Error removing an item:", error);
        }
    }

    useEffect(() => {
        if (!id) {
            navigate("/register")
        }

        const fetchUserInfo = async () => {
            try {
                const response = await fetch(
                    `http://localhost:5043/api/User/${id}`
                );
                if (response.ok) {
                    const data = await response.json();
                    setCurrentUser(data);
                } else {
                    alert("Failed to get user info.");
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            }
        }

        if (id) {
            fetchUserInfo();
            fetchCart();
        }
    }, [id, currentUser.userName, currentUser.email])

    const formik = useFormik({
        initialValues: {
            userName: "",
            newEmail: "",
            oldPass: "",
            newPass: ""
        },
        validationSchema: Yup.object({
            userName: Yup.string(),
            newEmail: Yup.string().email("Invalid email address"),
            oldPass: Yup.string().required("You need to input a password to update information"),
            newPass: Yup.string()
        }),
        onSubmit: async (values, { resetForm }) => {
            const queryString = new URLSearchParams(values);

            try {
                const response = await fetch(
                    `http://localhost:5043/api/User/update?userId=${id}&${queryString}`,
                    { method: "POST" }
                );

                if (response.ok) {
                    const data = await response.json();
                    alert("Information updated!");
                    setCurrentUser(data);
                    resetForm();
                } else {
                    const error = await response.json();
                    alert(error.message || "Information update failed!");
                }
            } catch (err) {
                console.error(err);
                alert("An error occurred while updating.");
            }
        }
    })

    return (
        <>
            <Header />
            <div className={styles.cartPageContainer}>
                <div className={styles.itemList}>
                    <h2 className={styles.listTitle}>Shopping List</h2>
                    {selectedItems?.length > 0 ? (
                        <>
                            {selectedItems.map((item) => (

                                <div className={styles.itemCard} key={item.id}>
                                    <img
                                        src={`http://localhost:5043/${item.imagePath}`}
                                        alt={item.instrumentName}
                                        className={styles.itemImage}
                                    />
                                    <div className={styles.itemDetails}>
                                        <p>{item.instrumentName}</p>
                                        <p>{item.instrumentBrand}</p>
                                        <p>Qty: {item.quantity}</p>
                                        <p>{item.price}$</p>
                                        <p>Total price: {item.price * item.quantity}$</p>
                                    </div>
                                    <div className={styles.itemControls}>
                                        <button onClick={() => removeItem(item.id, true)}>Remove one</button>
                                        <button onClick={() => removeItem(item.id, false)}>Remove all</button>
                                    </div>
                                </div>
                            ))}
                            <div className={styles.cartSummary}>
                                <p className={styles.totalPrice}>
                                    Total: ${selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)}
                                </p>
                                <div className={styles.actionButtons}>
                                    <button className={styles.purchaseButton} onClick={() => removeAll(true)}>Purchase</button>
                                    <button className={styles.clearButton} onClick={() => removeAll(false)}>Remove All</button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <p className={styles.noItems}>No items added</p>
                    )}
                </div>
                <div className={styles.userInfo}>
                    <p style={{ fontSize: "23px" }}>Username:</p>
                    <p>{currentUser.userName}</p>
                    <p style={{ fontSize: "23px" }}>Email:</p>
                    <p>{currentUser.email}</p>
                    <form className={styles.userForm} onSubmit={formik.handleSubmit}>
                        <h2>Change your information</h2>

                        <label htmlFor="userName">Username</label>
                        <input type="text"
                            name="userName"
                            id="userName"
                            placeholder="Enter new username (if needed)"
                            onBlur={formik.handleBlur}
                            value={formik.values.userName}
                            onChange={formik.handleChange}
                        />
                        {formik.touched.userName && formik.errors.userName ? (
                            <div className={styles.error}>{formik.errors.userName}</div>
                        ) : null}

                        <label htmlFor="newEmail">Email</label>
                        <input type="text"
                            name="newEmail"
                            id="newEmail"
                            placeholder="Enter new email (if needed)"
                            onBlur={formik.handleBlur}
                            value={formik.values.newEmail}
                            onChange={formik.handleChange}
                        />
                        {formik.touched.newEmail && formik.errors.newEmail ? (
                            <div className={styles.error}>{formik.errors.newEmail}</div>
                        ) : null}

                        <label htmlFor="oldPass">Password</label>
                        <input type="password"
                            name="oldPass"
                            id="oldPass"
                            placeholder="Enter current password"
                            onBlur={formik.handleBlur}
                            value={formik.values.oldPass}
                            onChange={formik.handleChange}
                        />
                        {formik.touched.oldPass && formik.errors.oldPass ? (
                            <div className={styles.error}>{formik.errors.oldPass}</div>
                        ) : null}

                        <label htmlFor="newPass">New password</label>
                        <input type="password"
                            name="newPass"
                            id="newPass"
                            placeholder="Enter new password (if needed)"
                            onBlur={formik.handleBlur}
                            value={formik.values.newPass}
                            onChange={formik.handleChange}
                        />
                        {formik.touched.newPass && formik.errors.newPass ? (
                            <div className={styles.error}>{formik.errors.newPass}</div>
                        ) : null}

                        <button type="submit">Submit changes</button>
                    </form>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default CartPage;