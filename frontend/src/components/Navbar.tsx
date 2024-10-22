// components/Navbar/Navbar.tsx
import React from 'react'
import { Link } from 'react-router-dom'

interface NavbarProps {
  isAdmin: boolean
}

const Navbar: React.FC<NavbarProps> = ({ isAdmin }) => {
  return (
    <nav className="bg-pokemonBlue p-4 flex justify-between items-center text-white shadow-lg font-pokemon">
      <div className="flex space-x-4">
        <Link to="/" className="text-xl hover:underline">
          Home
        </Link>
        <Link to="/collections" className="text-xl hover:underline">
          Collections
        </Link>
        <Link to="/boosters" className="text-xl hover:underline">
          Boosters
        </Link>
        {isAdmin && (
          <Link to="/admin" className="text-xl hover:underline">
            Admin
          </Link>
        )}
        <Link to="/marketplace" className="text-xl hover:underline">
          Marketplace
        </Link>
      </div>
    </nav>
  )
}

export default Navbar
