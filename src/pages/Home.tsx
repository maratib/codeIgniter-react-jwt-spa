import React from "react";
import { Alert } from "reactstrap";

interface HomeProps {}

const Home: React.FC<HomeProps> = (props) => {
  return (
    <div>
      <h1>Home Page</h1>
      <h1>Alerts</h1>

      <Alert color="primary">This is a primary alert — check it out!</Alert>
      <Alert color="secondary">This is a secondary alert — check it out!</Alert>
      <Alert color="success">This is a success alert — check it out!</Alert>
      <Alert color="danger">This is a danger alert — check it out!</Alert>
      <Alert color="warning">This is a warning alert — check it out!</Alert>
      <Alert color="info">This is a info alert — check it out!</Alert>
      <Alert color="light">This is a light alert — check it out!</Alert>
      <Alert color="dark">This is a dark alert — check it out!</Alert>
    </div>
  );
};
export default Home;
