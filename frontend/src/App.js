import React from 'react';
import { Routes, Route } from "react-router-dom";

import Home from './Home/Home';
import M3Module from './M3/m3';


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/m3/*" element={<M3Module/>}/>

    </Routes>
  );
}

export default App;
