import { Button } from "@tremor/react";
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { navContext } from "./common/NavProvider";
import {
  Square3Stack3DIcon,
  Cog6ToothIcon,
  // InboxArrowDownIcon,
  ChartBarIcon,
  PresentationChartLineIcon,
} from "@heroicons/react/24/outline";
import { useAccountSelectionStore } from "./pages/main/home/Store";
import { useAccountStore } from "./store/Account";
// import { open } from "@tauri-apps/plugin-dialog";
// import { importAccount } from "./api/import";

const Nav: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [auxButtons, setAuxButtons] = useState<React.ReactNode>(null);
  const { selectedAccounts } = useAccountSelectionStore();
  const { name } = useAccountStore();
  const l = useLocation();

  return (
    <navContext.Provider value={{ auxButtons, setAuxButtons }}>
      <div>
        <div className="flex h-full flex-row">
          <div className="bg-tremor -mr-2 h-full w-[75px] py-4">
            <div className="flex h-full flex-col justify-between">
              <div className="flex flex-col justify-start gap-8">
                {/* TODO: The navigation here is buggy. Need to get the active account ID properly. */}
                <Button
                  variant="light"
                  icon={
                    l.pathname.startsWith("/account/budget")
                      ? Cog6ToothIcon
                      : ChartBarIcon
                  }
                  color="slate"
                  size="lg"
                  tooltip="Account Forecast"
                  disabled={!l.pathname.startsWith("/account")}
                  onClick={() => {
                    l.pathname.startsWith("/account/budget")
                      ? navigate(`/account/${name}`)
                      : navigate(`/account/budget/${name}`);
                  }}
                />
                <Button
                  variant="light"
                  icon={PresentationChartLineIcon}
                  color="slate"
                  size="lg"
                  tooltip="Combined Forecast"
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
                {/* <Button
                  variant="light"
                  icon={InboxArrowDownIcon}
                  color="slate"
                  size="lg"
                  tooltip="Import Accounts"
                  onClick={async () => {
                    console.log("opening");
                    const file = await open();
                    file && (await importAccount(file.path));
                  }}
                /> */}
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
          <div className="flex w-full flex-col p-2">
            <div className="flex-grow border-l pl-2">{children}</div>
          </div>
        </div>
      </div>
    </navContext.Provider>
  );
};

export default Nav;
