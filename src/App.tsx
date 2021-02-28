import React from "react";
import { BrowserRouter, Link, Redirect, Route, Switch } from "react-router-dom";
import "./assets/styles/App.scss";
import About from "./pages/About";
import Home from "./pages/Home";
import Login from "./pages/Login";
import User from "./pages/User";
import RouterPaths from "./utils/RouterPaths";
import { Button } from "reactstrap";

export interface AppProps {}

export interface AppState {
  isSmallScreen: boolean;
}

class App extends React.Component<AppProps, AppState> {
  state = { isSmallScreen: false };

  componentDidMount() {
    window.addEventListener("resize", this.updateDimensions);

    this.updateDimensions(null);
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  private updateDimensions = (e: any) => {
    this.setState({ isSmallScreen: window.innerWidth < 500 });
  };
  render() {
    return (
      <BrowserRouter>
        <div>
          <h1>Hello from React 123 333</h1>
          <Button color="danger">Danger!</Button>

          {this.state.isSmallScreen ? "TRUE" : "FALSE"}
          <nav>
            <Link to={RouterPaths.HOME}>Home</Link>
            <Link to={RouterPaths.ABOUT}>About</Link>
            <Link to={RouterPaths.LOGIN}>Login</Link>
            <Link to={RouterPaths.USER}>User</Link>
          </nav>
          <Switch>
            <Route exact path={RouterPaths.HOME} component={Home} />
            <Route exact path={RouterPaths.ABOUT} component={About} />
            <Route exact path={RouterPaths.LOGIN} component={Login} />
            <Route exact path={RouterPaths.USER} component={User} />
            <Redirect to={RouterPaths.HOME} />
          </Switch>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
