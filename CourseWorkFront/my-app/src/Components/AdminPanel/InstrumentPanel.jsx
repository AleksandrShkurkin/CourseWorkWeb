import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../App";
import { useNavigate } from "react-router-dom";
import RouteHeader from "./RouteHeader";
import Header from "../ConstantComponents/Header";
import Footer from "../ConstantComponents/Footer";
import styles from "../CSSModules/InstrumentPanel.module.css";
import { useFormik } from "formik";
import AddForm from "./AddForm";
import EditForm from "./EditForm";

const InstrumentPanel = () => {
    const { id } = useContext(UserContext);
    const [instruments, setInstruments] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(-1);

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

    const readAll = async () => {
        try {
            const response = await fetch(
                `http://localhost:5043/api/Instrument/readAll`,
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
    }

    const deleteInstrument = async (instrumentID) => {
        try {
            const response = await fetch(
                `http://localhost:5043/api/Instrument/delete?id=${instrumentID}`,
                { method: "DELETE" }
            );
            if (response.ok) {
                await response.json();
                fetchInstruments(formik.values);
            } else {
                alert("Failed to fetch instruments.");
            }
        } catch (error) {
            console.error("Error fetching instruments:", error);
        }
    }

    return (
        <>
            <Header />
            <RouteHeader />
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
                    <hr className={styles.formDivider} />
                    {!editMode ? (
                        <AddForm readAll={readAll} />
                    ) : (
                        <EditForm editId={editId} setEditMode={setEditMode} readAll={readAll}/>
                    )}
                </div>

                <div className={styles.instrumentsList}>
                    {instruments.map((instrument) => (
                        <div key={instrument.id} className={styles.instrumentCard}>
                            <img src={`http://localhost:5043/${instrument.imagePath}`} alt={instrument.instrumentName} className={styles.instrumentImage} />
                            <h4>{instrument.instrumentName}</h4>
                            <p>Brand: {instrument.instrumentBrand}</p>
                            <p>Price: ${instrument.price}</p>
                            <div className={styles.buttonGroup}>
                                <button className={styles.editButton} onClick={() => {setEditMode(!editMode); setEditId(instrument.id)}}>
                                    {editMode === true && editId === instrument.id ? (
                                        <>Cancel</>
                                    ):(
                                        <>Edit</>
                                    )}
                                </button>
                                <button className={styles.deleteButton} onClick={() => deleteInstrument(instrument.id)}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </>
    );
}

export default InstrumentPanel;