import { Button, Divider, Title } from "@tremor/react";
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeftIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { useAccountStore } from "./store/Account";
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
  const state = useAccountStore();
  const previousRootName =
    previousRoot && capitalizeFirstLetter(previousRoot?.split("/")[1]);

  // TODO: this 'navigate back' functionality is not working
  if (location.pathname.toLowerCase().includes("account")) {
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
          Forecast
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
        Edit Account
      </Button>
    );
  }
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
          <div className="flex flex-row">
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
