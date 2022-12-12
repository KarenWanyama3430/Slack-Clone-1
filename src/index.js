import React from "react";
import ReactDOM from "react-dom";
import "semantic-ui-css/semantic.min.css";
import "./components/App.css";
import * as serviceWorker from "./serviceWorker";
import App from "./components/App";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import { BrowserRouter, Switch, Route, withRouter } from "react-router-dom";
import firebase from "./firebase";
import { createStore, compose, applyMiddleware } from "redux";
import reducers from "./redux/reducers";
import { Provider, connect } from "react-redux";
import thunk from "redux-thunk";
import { setUser, clearUser } from "./redux/actions";
import Spinner from "./components/spinner/Spinner";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(reducers, composeEnhancers(applyMiddleware(thunk)));

class Root extends React.Component {
  componentDidMount() {
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        await this.props.setUser(user);
        if (user.displayName) {
          this.props.history.push("/");
        }
      } else {
        this.props.clearUser();
        this.props.history.push("/login");
      }
    });
  }
  render() {
    if (this.props.loading) return <Spinner />;
    return (
      <Switch>
        <Route exact path="/" component={App} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/register" component={Register} />
      </Switch>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    loading: state.user.loading,
  };
};

const RootWithRouter = withRouter(
  connect(mapStateToProps, { setUser, clearUser })(Root)
);
ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <RootWithRouter />
    </BrowserRouter>
  </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
