import React from "react";
import { useFormik } from "formik";
import * as Yup from 'yup';
import styles from "../CSSModules/InstrumentPanel.module.css";

const AddForm = ({readAll}) => {
    const formikAdd = useFormik({
        initialValues: {
            name: "",
            brand: "",
            price: 0,
            image: null
        },
        validationSchema: Yup.object({
            name: Yup.string().required("Name is required"),
            brand: Yup.string().required("Brand is required"),
            price: Yup.number().positive("Price must be greater than 0").required("Price is required"),
            image: Yup.mixed().required("Image is required")
                .test(
                    "fileType",
                    "File must be an image (jpeg, png)",
                    (value) => {
                        return value && ["image/jpeg", "image/png"].includes(value.type);
                    }
                )
                .test(
                    "fileSize",
                    "File size is too large (max 2MB)",
                    (value) => {
                        return value && value.size <= 2 * 1024 * 1024;
                    }
                )
        }),
        onSubmit: async (values, { resetForm }) => {
            const formData = new FormData();
            formData.append("image", values.image);

            try {
                const response = await fetch(
                    `http://localhost:5043/api/Instrument/add?name=${values.name}&brand=${values.brand}&price=${values.price}`,
                    {
                        method: "POST",
                        body: formData
                    }
                );
                if (response.ok) {
                    await response.json();
                    readAll();
                    resetForm();
                } else {
                    alert("Failed to add instrument.");
                }
            } catch (error) {
                console.error("Error adding instrument:", error);
            }
        }
    });

    return (
        <>
            <h3>Add New Instrument</h3>
            <form onSubmit={formikAdd.handleSubmit}>
                <div className={styles.filterField}>
                    <label htmlFor="name">Enter Instrument Name</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter Name"
                        onBlur={formikAdd.handleBlur}
                        value={formikAdd.values.name}
                        onChange={formikAdd.handleChange}
                    />
                    {formikAdd.touched.name && formikAdd.errors.name ? (
                        <div className={styles.error}>{formikAdd.errors.name}</div>
                    ) : null}
                </div>
                <div className={styles.filterField}>
                    <label htmlFor="brand">Enter Instrument Brand</label>
                    <input
                        id="brand"
                        name="brand"
                        type="text"
                        placeholder="Enter Brand"
                        onBlur={formikAdd.handleBlur}
                        value={formikAdd.values.brand}
                        onChange={formikAdd.handleChange}
                    />
                    {formikAdd.touched.brand && formikAdd.errors.brand ? (
                        <div className={styles.error}>{formikAdd.errors.brand}</div>
                    ) : null}
                </div>
                <div className={styles.filterField}>
                    <label htmlFor="price">Enter Instrument Price</label>
                    <input
                        id="price"
                        name="price"
                        type="number"
                        placeholder="Enter Price"
                        onBlur={formikAdd.handleBlur}
                        value={formikAdd.values.price}
                        onChange={formikAdd.handleChange}
                    />
                    {formikAdd.touched.price && formikAdd.errors.price ? (
                        <div className={styles.error}>{formikAdd.errors.price}</div>
                    ) : null}
                </div>
                <div className={styles.filterField}>
                    <label htmlFor="image">Upload Instrument Image</label>
                    <input
                        id="image"
                        name="image"
                        type="file"
                        accept="image/*"
                        onChange={(event) => formikAdd.setFieldValue("image", event.target.files[0])}
                        onSubmit={(event) => formikAdd.setFieldValue("image", "")}
                    />
                    {formikAdd.touched.image && formikAdd.errors.image ? (
                        <div className={styles.error}>{formikAdd.errors.image}</div>
                    ) : null}
                </div>
                <button type="submit" className={styles.submitButton}>
                    Add Instrument
                </button>
            </form>
        </>
    );
}

export default AddForm;