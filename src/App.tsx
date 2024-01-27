import React from "react";
import "./App.css";
import { Link, MemoryRouter, Route, Routes } from "react-router-dom";
import Budget from "./budget/Main";
import Retirement from "./retirement/Main";
import Nav from "./Nav";
import Scenario from "./scenario/Main";

const Home: React.FC = () => {
    return (
        <div>
            <Nav
                subtitle=""
                path="/"
            />
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <div>
                        <Link to="/Scenario">Scenarios</Link>
                    </div>
                    <div>
                        <Link to="/budget">Budget</Link>
                    </div>
                    <div>
                        <Link to="/retirement">Retirement</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

const App: React.FC = () => {
    return (
        <div className='p-4'>
            <MemoryRouter>
                <Routes>
                    <Route path="/" Component={Home} />
                    <Route path="/budget" Component={Budget} />
                    <Route path="/retirement" Component={Retirement} />
                    <Route path="/scenario" Component={Scenario} />
                </Routes>
            </MemoryRouter>
        </div>
    );
}

export default App;
