import React, { Component } from "react";
import {
  Grid,
  Header,
  Icon,
  Form,
  Segment,
  Button,
  Message,
} from "semantic-ui-react";
import { Link } from "react-router-dom";
import firebase from "../../firebase";

export class Login extends Component {
  state = {
    email: "",
    password: "",
    loading: false,
    errors: [],
  };

  isFormValidTest = ({ email, password }) => email && password;
  handleChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };
  handleSubmit = async (event) => {
    event.preventDefault();
    if (this.isFormValidTest(this.state)) {
      this.setState({ loading: true, errors: [] });
      try {
        await firebase
          .auth()
          .signInWithEmailAndPassword(this.state.email, this.state.password);
        this.setState({ loading: false });
        this.props.history.push("/");
      } catch (error) {
        this.setState({
          loading: false,
          errors: this.state.errors.concat(error),
        });
        console.log(error);
      }
    }
    setTimeout(() => {
      this.setState({ errors: [] });
    }, 3000);
    this.setState({
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
    });
  };

  displayErrors = (errors) =>
    errors.map((error, index) => <p key={index}>{error.message}</p>);

  handleInputError = (errors, inputName) => {
    return errors.some((error) =>
      error.message.toLowerCase().includes(inputName)
    )
      ? "error"
      : "";
  };

  render() {
    const { password, email, errors } = this.state;
    return (
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h1" icon color="violet" textAlign="center">
            <Icon name="code branch" color="violet" />
            Sign In to SlackChat
          </Header>
          <Form size="large" onSubmit={this.handleSubmit}>
            <Segment stacked>
              <Form.Input
                fluid
                name="email"
                icon="mail"
                iconPosition="left"
                placeholder="Email Address"
                onChange={this.handleChange}
                value={email}
                type="email"
                className={this.handleInputError(errors, "email")}
              />
              <Form.Input
                fluid
                name="password"
                icon="lock"
                iconPosition="left"
                placeholder="passoword"
                onChange={this.handleChange}
                value={password}
                type="password"
                className={this.handleInputError(errors, "password")}
              />

              <Button
                loading={this.state.loading}
                disabled={this.state.loading}
                color="violet"
                fluid
                size="large"
              >
                Submit
              </Button>
            </Segment>
          </Form>

          {errors.length > 0 && (
            <Message error>
              <h3>Error</h3>
              {this.displayErrors(errors)}
            </Message>
          )}
          <Message>
            Don't have an account ? <Link to="/register">Register</Link>{" "}
          </Message>
        </Grid.Column>
      </Grid>
    );
  }
}

export default Login;
