import { Button, Divider, Title } from "@tremor/react";
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeftIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { useStore } from "./store/Account";
import { AccountSelect } from "./common/Select";
import { navContext } from "./common/NavProvider";
import { saveAccount } from "./api/account";

const capitalizeFirstLetter = (s: string): string => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const NavButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [previousRoot, setPreviousRoot] = React.useState<string | null>(null);
  const state = useStore();
  const previousRootName =
    previousRoot && capitalizeFirstLetter(previousRoot?.split("/")[1]);

  if (location.pathname.toLowerCase().includes("scenario")) {
    if (previousRoot && previousRootName) {
      return (
        <Button
          size="md"
          variant="light"
          icon={ArrowLeftIcon}
          onClick={() => {
            saveAccount(state);
            setPreviousRoot(previousRoot);
            navigate(previousRoot.toLowerCase());
          }}
        >
          Go Back to {previousRootName}
        </Button>
      );
    } else {
      return (
        <Button
          size="md"
          variant="light"
          icon={ArrowLeftIcon}
          onClick={() => {
            saveAccount(state);
            setPreviousRoot("/");
            navigate("/");
          }}
        >
          Go Home
        </Button>
      );
    }
  } else {
    return (
      <Button
        size="md"
        variant="light"
        icon={Cog6ToothIcon}
        onClick={() => {
          setPreviousRoot(location.pathname);
          navigate(`/scenario/${state.name}`);
        }}
      >
        Edit Scenario
      </Button>
    );
  }
};

const Nav: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [auxButtons, setAuxButtons] = useState<React.ReactNode>(null);
  const [_, subtitle, ...pages] = location.pathname.split("/");

  return (
    <navContext.Provider value={{ auxButtons, setAuxButtons }}>
      <div>
        <nav className="flex flex-row justify-between">
          <div className="flex flex-row">
            <ul className="flex items-center space-x-2">
              <li>
                <Link to={"/"}>
                  <Title className="font-light hover:opacity-80 active:opacity-70">
                    Home
                  </Title>
                </Link>
              </li>
              {subtitle && <Title className="font-light">//</Title>}
              <li>
                {pages ? (
                  <Link to={`/${subtitle}`}>
                    <Title className="font-light hover:opacity-80 active:opacity-70">
                      {subtitle && capitalizeFirstLetter(subtitle)}
                    </Title>
                  </Link>
                ) : (
                  <Title className="font-light">
                    {subtitle && capitalizeFirstLetter(subtitle)}
                  </Title>
                )}
              </li>
            </ul>
          </div>
          <AccountSelect
            className={"flex max-w-[500px] flex-grow flex-row gap-2"}
          >
            {auxButtons}
          </AccountSelect>
          <NavButton />
        </nav>
        <Divider />
        {children}
      </div>
    </navContext.Provider>
  );
};

export default Nav;
