import { Divider, Title } from "@tremor/react";
import React from "react";
import { Link, useLocation } from "react-router-dom";

const capitalizeFirstLetter = (s: string): string => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const Nav: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [_, subtitle, page] = location.pathname.split("/");
  return (
    <div>
      <nav>
        <div className="flex">
          <ul className="flex items-center space-x-2">
            <li>
              <Link to={"/"}>
                <Title className="hover:opacity-80 active:opacity-70 font-light">Home</Title>
              </Link>
            </li>
            {subtitle && <Title className="font-light">//</Title>}
            <li>
              {page ? (
                <Link to={`/${subtitle}`}>
                  <Title className="hover:opacity-80 active:opacity-70 font-light">{subtitle && capitalizeFirstLetter(subtitle)}</Title>
                </Link>
              ) : (
                <Title className="font-light">{subtitle && capitalizeFirstLetter(subtitle)}</Title>
              )}
            </li>
            {page && <Title className="font-light">//</Title>}
            <li>
              <Title className="font-light">{page && capitalizeFirstLetter(page)}</Title>
            </li>
          </ul>
        </div>
      </nav>
      <Divider />
      {children}
    </div>
  );
};

export default Nav;
