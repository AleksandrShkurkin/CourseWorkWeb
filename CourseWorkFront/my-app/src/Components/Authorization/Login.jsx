import React, { useContext } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import styles from "../CSSModules/LoginForm.module.css";
import { UserContext } from "../../App";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
  const { setId, setIsAdmin } = useContext(UserContext);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email address").required("Email is required"),
      password: Yup.string().required("Password is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      const queryString = new URLSearchParams(values);

      try {
        const response = await fetch(
          `http://localhost:5043/api/User/login?${queryString}`,
          { method: "POST" }
        );

        if (response.ok) {
          const data = await response.json();
          alert(`Login successful! User ID: ${data.idSave}`);
          setId(data.idSave);
          setIsAdmin(data.isAdmin);
          resetForm();
          navigate("/");
        } else {
          const error = await response.json();
          alert(error.message || "Login failed");
        }
      } catch (err) {
        console.error(err);
        alert("An error occurred while logging in.");
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className={styles.formContainer}>
      <h2 className={styles.formTitle}>Login</h2>

      <div className={styles.formGroup}>
        <label htmlFor="email" className={styles.label}>Email</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Email"
          className={styles.inputField}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.email}
        />
        {formik.touched.email && formik.errors.email ? (
          <div className={styles.error}>{formik.errors.email}</div>
        ) : null}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="password" className={styles.label}>Password</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Password"
          className={styles.inputField}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.password}
        />
        {formik.touched.password && formik.errors.password ? (
          <div className={styles.error}>{formik.errors.password}</div>
        ) : null}
      </div>

      <button type="submit" className={styles.submitButton}>Login</button>
    </form>
  );
};

export default LoginForm;