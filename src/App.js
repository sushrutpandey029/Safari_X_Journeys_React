import logo from './logo.svg';
import Home from './coponent/Home/home';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';


import Header from './coponent/Master/header';
import Footer from './coponent/Master/fotter';

import Booking from './coponent/Booking/Booking';
import Places from './coponent/places/Places';



function App() {
  return (
    <div>
    <Header />
    {/* <Home/> */}
      <Booking/>
      <Places/>
      <Footer />
    </div>
  );
}

export default App;
