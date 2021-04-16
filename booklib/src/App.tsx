import './App.css'
import Login from './views/Login'
import theme from './theme'
import { ChakraProvider } from "@chakra-ui/react"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"
import Navbar from './components/Navbar'
import { Fragment } from 'react'
import NoMatch from './views/NoMatch'

function App() {
  const MainRoutes = () => (<Fragment>
    <Navbar/>
    <Switch>
      <Route path="*">
        <NoMatch />
      </Route>
    </Switch>
  </Fragment>)
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Switch>
          <Route path="/login">
            <Login/>
          </Route>
          <Route component={MainRoutes}/>
        </Switch>
      </Router>
    </ChakraProvider>
  )
}

export default App
