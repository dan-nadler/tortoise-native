import React from "react";
import "./App.css";
import { Link, MemoryRouter, Route, Routes } from "react-router-dom";
import Budget from "./budget/Main";
import Retirement from "./retirement/Main";
import Nav from "./Nav";
import Create from "./create/Main";

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
                        <Link to="/budget">Budget</Link>
                    </div>
                    <div>
                        <Link to="/retirement">Retirement</Link>
                    </div>
                    <div>
                        <Link to="/create">Create</Link>
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
                    <Route path="/create" Component={Create} />
                </Routes>
            </MemoryRouter>
        </div>
    );
}

export default App;
