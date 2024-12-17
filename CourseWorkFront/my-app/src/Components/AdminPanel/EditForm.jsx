import React from "react";
import { useFormik } from "formik";
import styles from "../CSSModules/InstrumentPanel.module.css";

const EditForm = ({editId, setEditMode, readAll}) => {
    const formikEdit = useFormik({
        initialValues: {
            name: "",
            brand: "",
            price: 0,
            image: null
        },
        onSubmit: async (values, { resetForm }) => {
            const formData = new FormData();
            formData.append("image", values.image);

            try {
                const response = await fetch(
                    `http://localhost:5043/api/Instrument/update?id=${editId}&name=${values.name}&brand=${values.brand}&price=${values.price}`,
                    {
                        method: "POST",
                        body: formData
                    }
                );
                if (response.ok) {
                    await response.json();
                    readAll();
                    setEditMode(false);
                    resetForm();
                } else {
                    alert("Failed to edit instrument.");
                }
            } catch (error) {
                console.error("Error editing instrument:", error);
            }
        }
    });

    return (
        <>
            <h3>Edit Instrument</h3>
            <form onSubmit={formikEdit.handleSubmit}>
                <div className={styles.filterField}>
                    <label htmlFor="name">Enter Instrument Name</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter Name (if needed)"
                        onBlur={formikEdit.handleBlur}
                        value={formikEdit.values.name}
                        onChange={formikEdit.handleChange}
                    />
                </div>
                <div className={styles.filterField}>
                    <label htmlFor="brand">Enter Instrument Brand</label>
                    <input
                        id="brand"
                        name="brand"
                        type="text"
                        placeholder="Enter Brand (if needed)"
                        onBlur={formikEdit.handleBlur}
                        value={formikEdit.values.brand}
                        onChange={formikEdit.handleChange}
                    />
                </div>
                <div className={styles.filterField}>
                    <label htmlFor="price">Enter Instrument Price</label>
                    <input
                        id="price"
                        name="price"
                        type="number"
                        placeholder="Enter Price (if needed)"
                        onBlur={formikEdit.handleBlur}
                        value={formikEdit.values.price}
                        onChange={formikEdit.handleChange}
                    />
                </div>
                <div className={styles.filterField}>
                    <label htmlFor="image">Upload Instrument Image</label>
                    <input
                        id="image"
                        name="image"
                        type="file"
                        accept="image/*"
                        onChange={(event) => formikEdit.setFieldValue("image", event.target.files[0])}
                    />
                </div>
                <button type="submit" className={styles.submitButton}>
                    Edit Instrument
                </button>
            </form>
        </>
    );
}

export default EditForm;