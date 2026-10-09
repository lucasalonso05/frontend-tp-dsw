import {useState} from 'react'
function App() {
  const unitPrice = 3000000
  const [quantity, setQuantity] = useState(1)
  return (
      <main className="min-h-screen p-4">
          <h1 className="text-2xl font-bold text-blue-600">Eventify</h1>
          <p>Precio por entrada: {unitPrice}</p>
          <button 
            className="rounded bg-blue-600 px-4 py-2 text-white"
            onClick={() => console.log('click')}>
            +
          </button>
        <p>Cantidad: {quantity}</p>
        <button onClick={()=>setQuantity(quantity + 1)}>+</button>
      </main>
  )
}
export default App
