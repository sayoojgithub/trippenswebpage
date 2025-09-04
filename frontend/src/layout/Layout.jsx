// import React from 'react'
// import Header from '../components/Header/Header'
// import Footer from '../components/Footer/Footer'
// import Routers from '../routes/Routers'

// const Layout = () => {
//   return <>
//     <Header/>
//     <main>
//         <Routers/>
//     </main>
//     <Footer/>
//   </>
// }

// export default Layout
// frontend/src/layout/Layout.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import TopBar from "../components/TopBar/TopBar";
import Header from "../components/Header/Header";
import TestimonialCarousel from "../pages/TestimonialCarousel";
import EnquiryForm from "../pages/EnquiryForm";
import Footer from "../components/Footer/Footer";

import Routers from "../routes/Routers";

const Layout = () => {
  const location = useLocation();

  // check if path starts with /admin
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminRoute && <TopBar />}
      {!isAdminRoute && <Header />}
      <main>
        <Routers />
      </main>
      {!isAdminRoute && <TestimonialCarousel />}
      {!isAdminRoute && <EnquiryForm />}
      {!isAdminRoute && <Footer />}
    </>
  );
};

export default Layout;
