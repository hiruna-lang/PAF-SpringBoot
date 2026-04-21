import React from 'react'
import { useNavigate } from 'react-router-dom';
<<<<<<< Updated upstream
=======
import { getUser, isLoggedIn, isAdmin } from '../M4/authService';
import './Home.css';
>>>>>>> Stashed changes

function Home() {
<<<<<<< Updated upstream
    const navigate = useNavigate();
=======
  const navigate = useNavigate();
  useReveal();

  // Check if already logged in — used to personalize navbar
  const loggedIn = isLoggedIn();
  const user     = loggedIn ? getUser() : null;

>>>>>>> Stashed changes
  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      <button onClick={() => navigate('/m1  ')}>M1</button>
        <button onClick={() => navigate('/m2')}>M2</button> 
        <button onClick={() => navigate('/m3')}>M3</button>
        <button onClick={() => navigate('/m4')}>M4</button>
    </div>
  )
}

export default Home
