import React, { useState, useEffect } from 'react'
import pokeball from '/pokeball.jpg'
interface HeaderProps {
  isAdmin: boolean
  onLogin: (isAdmin: boolean) => void
}

const Header: React.FC<HeaderProps> = ({ isAdmin, onLogin }) => {
  const [password, setPassword] = useState<string>('')

  // brute force, je me suis pas intéressé à la sécurité dans ce cas
  const handleLogin = () => {
    const adminPassword = 'admin'
    if (password === adminPassword) {
      onLogin(true)
      localStorage.setItem('isAdmin', 'true')
      localStorage.setItem('adminPassword', adminPassword)
      setPassword('')
    } else {
      alert('Invalid password')
    }
  }

  // Handle logout
  const handleLogout = () => {
    onLogin(false)
    localStorage.removeItem('isAdmin')
  }

  useEffect(() => {
    const storedAdminStatus = localStorage.getItem('isAdmin') === 'true'
    onLogin(storedAdminStatus)
  }, [onLogin])

  return (
    <div className="relative bg-pokemonBlue p-4 flex justify-between items-center text-white shadow-lg font-pokemon overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <div
          className="w-full h-full bg-repeat animate-move-pattern opacity-15"
          style={{ backgroundImage: 'url(' + pokeball + ')' }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex justify-between items-center w-full">
        <h1 className="text-3xl">Pokémon TCG DApp</h1>
        {isAdmin ? (
          <button
            className="bg-pokemonRed px-4 py-2 rounded-full hover:bg-red-600 shadow-button transition duration-300"
            onClick={handleLogout}
          >
            Logout Admin
          </button>
        ) : (
          <div className="flex items-center space-x-2">
            <input
              type="password"
              className="px-2 py-1 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pokemonBlue focus:border-transparent bg-white text-gray-800"
              placeholder="Admin Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleLogin()
                }
              }}
            />
            <button
              className="bg-pokemonYellow px-4 py-2 rounded-full hover:bg-yellow-400 shadow-button transition duration-300"
              onClick={handleLogin}
            >
              Login as Admin
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Header
