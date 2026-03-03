import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [message, setMessage] = useState("Connecting to SHIELD Agent...")

  useEffect(() => {
    // Calling the Python Backend
    axios.get('http://127.0.0.1:8000/')
      .then(response => {
        setMessage(response.data.message)
      })
      .catch(error => {
        console.error("Error connecting to backend:", error)
        setMessage("Connection Failed. Is the Backend running?")
      })
  }, [])

  return (
    <div className="App">
      <h1>SHIELD.ai Safety Agent</h1>
      <div className="card">
        <p>Backend Status: <strong>{message}</strong></p>
      </div>
    </div>
  )
}

export default App