import React from 'react'
import ProtectedRoute from './ProtectedRoute'
import Home from '../pages/Home'
import AdminLogin from '../pages/Admin/AdminLogin'
import AdminRegister from '../pages/Admin/AdminRegister'
import AdminDashboard from '../pages/Admin/AdminDashboard'
import CategoryPage from '../pages/CategoryPage'
import TourDetailsSingle from '../pages/TourDetailsSingle'
import LandscapePage from '../pages/LandscapePage'
import ContactSplit from '../pages/ContactSplit'
import {Routes,Route} from 'react-router-dom'


const Routers = () => {
  return <Routes>
    <Route path="/" element={<Home/>}/>
    <Route path="/home" element={<Home/>}/>
    <Route path="/adminLogin" element={<AdminLogin/>}/>
    <Route path="/adminRegister" element={<AdminRegister/>}/>
    <Route path="/categories/:categoryId" element={<CategoryPage />} />
    <Route path="/tours/:tourId" element={<TourDetailsSingle />} />
    <Route path="/landscapes/:landscape" element={<LandscapePage />} />
    <Route path="/contact" element={<ContactSplit/>}/>

    <Route
        path='/adminDashboard'
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
  </Routes>
}

export default Routers