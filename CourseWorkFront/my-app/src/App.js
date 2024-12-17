import './App.css';
import RegistrationForm from './Components/Authorization/Registration';
import LoginForm from './Components/Authorization/Login';
import HomePage from './Components/MainScreens/HomePage';
import CartPage from './Components/MainScreens/CartPage';
import UserPanel from './Components/AdminPanel/UserPanel';
import InstrumentPanel from './Components/AdminPanel/InstrumentPanel';
import React, { useState, createContext } from 'react';
import { createBrowserRouter, RouterProvider, createRoutesFromElements, Route } from 'react-router-dom';

export const UserContext = createContext();

function App() {
  const [id, setId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route
          path="/"
          element={
            <HomePage />
          }
        />
        <Route
          path='/register'
          element={
            <div className='auth-screen'>
              <RegistrationForm />
              <LoginForm />
            </div>
          }
        />
        <Route
          path='/cart'
          element={
            <CartPage />
          }
        />
        <Route
        path='/admin/users'
        element={
          <UserPanel />
        }
        />
        <Route
        path='/admin/instruments'
        element={
          <InstrumentPanel />
        }
        />
      </>
    )
  );

  return (
    <UserContext.Provider value={{ id, setId, isAdmin, setIsAdmin }}>
      <div className="app">
        <RouterProvider router={router} />
      </div>
    </UserContext.Provider>
  );
}

export default App;
