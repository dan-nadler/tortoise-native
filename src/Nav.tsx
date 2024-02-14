import { Button } from "@tremor/react";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { navContext } from "./common/NavProvider";
import {
  Square3Stack3DIcon,
  Cog6ToothIcon,
  InboxArrowDownIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { useAccountSelectionStore } from "./pages/home/Store";

const Nav: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [auxButtons, setAuxButtons] = useState<React.ReactNode>(null);
  const { selectedAccounts } = useAccountSelectionStore();

  return (
    <navContext.Provider value={{ auxButtons, setAuxButtons }}>
      <div>
        <div className="flex h-full flex-row">
          <div className="bg-tremor h-full w-[75px] bg-slate-300 py-4 dark:bg-slate-950">
            <div className="flex h-full flex-col justify-between">
              <div className="flex flex-col justify-start gap-8 py-20">
                <Button
                  variant="light"
                  icon={ChartBarIcon}
                  color="slate"
                  size="lg"
                  tooltip="View Forecast"
                  onClick={() => {
                    const accounts = new URLSearchParams();
                    accounts.append("accounts", selectedAccounts.join(","));
                    navigate("/scenario?" + accounts.toString());
                  }}
                />
                <Button
                  color="slate"
                  variant="light"
                  icon={Square3Stack3DIcon}
                  size="lg"
                  tooltip="Manage Accounts"
                  onClick={() => navigate("/")}
                />
                <Button
                  variant="light"
                  icon={InboxArrowDownIcon}
                  color="slate"
                  size="lg"
                  tooltip="Import Accounts"
                  onClick={() => null}
                />
                {auxButtons}
              </div>
              <div className="flex flex-col justify-end gap-4">
                <Button
                  variant="light"
                  icon={Cog6ToothIcon}
                  color="slate"
                  size="lg"
                  tooltip="Settings"
                  onClick={() => null}
                />
              </div>
            </div>
          </div>
          <div className="mx-4 flex w-full flex-col">
            <div className="flex-grow">{children}</div>
          </div>
        </div>
      </div>
    </navContext.Provider>
  );
};

export default Nav;
