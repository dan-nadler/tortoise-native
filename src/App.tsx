import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Budget from "./pages/account/budget/Main";
import Retirement from "./pages/retirement/Main";
import Nav from "./Nav";
import Account from "./pages/account/Main";
import CashFlowForm from "./pages/account/CashFlow";
import Scenario from "./pages/scenario/Main";
import { Grid } from "@tremor/react";
import Home from "./pages/home/Main";

const App: React.FC = () => {
  return (
    <Grid className="min-h-dvh bg-tremor-background dark:bg-dark-tremor-background">
      <MemoryRouter>
        <Nav>
          <Routes>
            <Route path="/" Component={Home} />
            <Route path="/retirement" Component={Retirement} />
            <Route path="/account" Component={Account} />
            <Route path="/account/:name" Component={Account} />
            <Route path="/account/:name/:index" Component={CashFlowForm} />
            <Route path="/account/budget/:name" Component={Budget} />
            <Route path="/scenario" Component={Scenario} />
          </Routes>
        </Nav>
      </MemoryRouter>
    </Grid>
  );
};

export default App;
