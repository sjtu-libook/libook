import './App.css'
import Login from './views/Login'
import theme from './theme'
import { ChakraProvider } from "@chakra-ui/react"

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Login />
    </ChakraProvider>
  )
}

export default App
