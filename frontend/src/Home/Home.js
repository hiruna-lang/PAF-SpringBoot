import React from 'react'
import { useNavigate } from 'react-router-dom';

function Home() {
    const navigate = useNavigate();
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
