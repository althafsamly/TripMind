import React from 'react'
import Hero from './components/custom/Hero'
import HowItWorks from './components/custom/HowItWorks'
import Advantages from './components/custom/Advantages'
import Footer from './components/custom/Footer'

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <HowItWorks />
      <Advantages />
      <div className="flex-grow" />
      <Footer />
    </div>
  )
}

export default App
