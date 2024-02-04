import React from "react";
import { Link, MemoryRouter, Route, Routes } from "react-router-dom";
import Budget from "./budget/Main";
import Retirement from "./retirement/Main";
import Nav from "./Nav";
import Scenario from "./scenario/Main";
import CashFlowForm from "./scenario/CashFlow";
import { Grid, Subtitle } from "@tremor/react";
import { navContext } from "./common/NavProvider";

const Home: React.FC = () => {
  return (
    <div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div>
            <Link to="/scenario">
              <Subtitle
                color="slate"
                className="font-light hover:opacity-80 active:opacity-70"
              >
                Scenarios
              </Subtitle>
            </Link>
          </div>
          <div>
            <Link to="/budget">
              <Subtitle
                color="slate"
                className="font-light hover:opacity-80 active:opacity-70"
              >
                Budget
              </Subtitle>
            </Link>
          </div>
          <div>
            <Link to="/retirement">
              <Subtitle
                color="slate"
                className="font-light hover:opacity-80 active:opacity-70"
              >
                Retirement
              </Subtitle>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  
  return (
      <Grid className="min-h-dvh bg-tremor-background p-4 dark:bg-dark-tremor-background">
        <MemoryRouter>
          <Nav>
            <Routes>
              <Route path="/" Component={Budget} />
              <Route path="/budget" Component={Budget} />
              <Route path="/retirement" Component={Retirement} />
              <Route path="/scenario" Component={Scenario} />
              <Route path="/scenario/:name" Component={Scenario} />
              <Route path="/scenario/:name/:index" Component={CashFlowForm} />
            </Routes>
          </Nav>
        </MemoryRouter>
      </Grid>
  );
};

export default App;
