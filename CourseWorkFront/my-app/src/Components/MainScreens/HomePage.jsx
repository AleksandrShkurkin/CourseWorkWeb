import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../../App";
import { useNavigate } from "react-router-dom";
import Header from '../ConstantComponents/Header';
import Footer from '../ConstantComponents/Footer';
import { useFormik } from "formik";
import styles from "../CSSModules/HomePage.module.css"

const HomePage = () => {
    const { id } = useContext(UserContext);
    const [instruments, setInstruments] = useState([]);
    let navigate = useNavigate();

    useEffect(() => {
        if (!id) {
            navigate("/register")
        }
    }, [id, navigate])

    let timer;

    const debounce = (func, delay) => {
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => func(...args), delay);
        };
    };

    const fetchInstruments = async (values) => {
        try {
            const queryString = new URLSearchParams(values);
            const response = await fetch(
                `http://localhost:5043/api/Instrument/readFiltered?${queryString}`
            );
            if (response.ok) {
                const data = await response.json();
                setInstruments(data);
            } else {
                alert("Failed to fetch instruments.");
            }
        } catch (error) {
            console.error("Error fetching instruments:", error);
        }
    };

    const formik = useFormik({
        initialValues: {
            searchName: "",
            searchBrand: "",
            priceFilter: 0,
            filterMode: -1,
        },
        onChange: debounce(fetchInstruments, 1000),
        enableReinitialize: true,
    });

    useEffect(() => {
        fetchInstruments(formik.values);
    }, [formik.values]);

    const addToCart = async (values) => {
        try {
            const queryString = new URLSearchParams(values);
            const response = await fetch(
                `http://localhost:5043/api/User/${id}/cart/add?${queryString}`,
                { method: "POST" });
            if (response.ok)
            {
                await response.json();
                alert("Added to cart");
            }
            else
            {
                alert("Failed adding to cart");
            }
        } catch (error) {
            console.error("Error adding to cart:", error);
        }
    }

    return (
        <>
            <Header />
            <div className={styles.homePage}>
                <div className={styles.filterForm}>
                    <h3>Filter Instruments</h3>
                    <form>
                        <div className={styles.filterField}>
                            <label htmlFor="searchName">Search Name</label>
                            <input
                                id="searchName"
                                name="searchName"
                                type="text"
                                placeholder="Instrument Name"
                                value={formik.values.searchName}
                                onChange={formik.handleChange}
                            />
                        </div>
                        <div className={styles.filterField}>
                            <label htmlFor="searchBrand">Search Brand</label>
                            <input
                                id="searchBrand"
                                name="searchBrand"
                                type="text"
                                placeholder="Instrument Brand"
                                value={formik.values.searchBrand}
                                onChange={formik.handleChange}
                            />
                        </div>
                        <div className={styles.filterField}>
                            <label htmlFor="filterMode">Price Filter Mode</label>
                            <select
                                id="filterMode"
                                name="filterMode"
                                value={formik.values.filterMode}
                                onChange={formik.handleChange}
                            >
                                <option value={-1}>&ge;</option>
                                <option value={0}>=</option>
                                <option value={1}>&le;</option>
                            </select>
                        </div>
                        <div className={styles.filterField}>
                            <label htmlFor="priceFilter">Price</label>
                            <input
                                id="priceFilter"
                                name="priceFilter"
                                type="number"
                                placeholder="Enter Price"
                                value={formik.values.priceFilter}
                                onChange={(event) => {
                                    const value = parseFloat(event.target.value);
                                    formik.setFieldValue("priceFilter", value);
                                }}
                            />
                        </div>
                    </form>
                </div>

                <div className={styles.instrumentsList}>
                    {instruments.map((instrument) => (
                        <div key={instrument.id} className={styles.instrumentCard}>
                            <img src={`http://localhost:5043/${instrument.imagePath}`} alt={instrument.instrumentName} className={styles.instrumentImage} />
                            <h4>{instrument.instrumentName}</h4>
                            <p>Brand: {instrument.instrumentBrand}</p>
                            <p>Price: ${instrument.price}</p>
                            <button className={styles.addToCartButton} onClick={() => addToCart({instrumentId: instrument.id})}>Add to Cart</button>
                        </div>
                    ))}
                </div>
            </div>
            <Footer/>
        </>
    );
};

export default HomePage;