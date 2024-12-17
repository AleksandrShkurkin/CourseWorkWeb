import React, { useContext } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import styles from "../CSSModules/RegistrationForm.module.css"
import { UserContext } from "../../App";
import { useNavigate } from "react-router-dom";

const RegistrationForm = () => {
  const { setId, setIsAdmin } = useContext(UserContext);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      userName: "",
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      userName: Yup.string().required("Username is required"),
      email: Yup.string().email("Invalid email address").required("Email is required"),
      password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      const { userName, email, password } = values;
      const queryString = new URLSearchParams({ userName, email, password });

      try {
        const response = await fetch(`http://localhost:5043/api/User/register?${queryString}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          const data = await response.json();
          alert(data.message);
          setId(data.idSave);
          setIsAdmin(data.isAdmin);
          resetForm();
          navigate("/");
        } else {
          const error = await response.json();
          alert(error.message || "Registration failed");
        }
      } catch (err) {
        console.error(err);
        alert("An error occurred while registering.");
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className={styles.formContainer}>
      <h2 className={styles.formTitle}>Register</h2>

      <div className={styles.formGroup}>
        <label htmlFor="userName" className={styles.label}>Username</label>
        <input
          id="userName"
          name="userName"
          type="text"
          placeholder="Username"
          className={styles.inputField}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.userName}
        />
        {formik.touched.userName && formik.errors.userName ? (
          <div className={styles.error}>{formik.errors.userName}</div>
        ) : null}
      </div>

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

      <button type="submit" className={styles.submitButton}>Register</button>
    </form>
  );
};

export default RegistrationForm;