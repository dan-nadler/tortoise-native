import { Divider, Title } from "@tremor/react";
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { navContext } from "./common/NavProvider";

const capitalizeFirstLetter = (s: string): string => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const Nav: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [auxButtons, setAuxButtons] = useState<React.ReactNode>(null);
  const [_, ...pages] = location.pathname.split("/");
  let titleClass = "font-light hover:opacity-80 active:opacity-70";

  return (
    <navContext.Provider value={{ auxButtons, setAuxButtons }}>
      <div>
        <nav className="flex flex-row justify-between">
          <div className="flex w-1/3 flex-shrink flex-grow-0 flex-row">
            <ul className="flex items-center space-x-2">
              <li key="home">
                <Link to="/">
                  <Title className={titleClass}>Home</Title>
                </Link>
              </li>
              {pages.map((p, i) => {
                if (!p) return null;
                return (
                  <>
                    <Title>//</Title>
                    <li key={i}>
                      <Link to={"/" + pages.slice(0, i + 1).join("/")}>
                        <Title className={titleClass}>
                          {capitalizeFirstLetter(p)}
                        </Title>
                      </Link>
                    </li>
                  </>
                );
              })}
            </ul>
          </div>
          {auxButtons}
          <div className="w-1/3 flex-shrink flex-grow-0" />
        </nav>
        <Divider />
        {children}
      </div>
    </navContext.Provider>
  );
};

export default Nav;
