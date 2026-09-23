import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import PlanTrip from "./pages/PlanTrip";
import TripResult from "./pages/TripResult";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyTrips from "./pages/MyTrips";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/plan-trip" element={<PlanTrip />} />
        <Route path="/trip-result" element={<TripResult />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/my-trips" element={<MyTrips />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;