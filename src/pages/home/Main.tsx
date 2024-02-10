import {
  Card,
  Title,
  Text,
  Divider,
  Badge,
  Subtitle,
  Button,
  Dialog,
  DialogPanel,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableBody,
} from "@tremor/react";
import React, { useContext, useEffect } from "react";
import {
  BeakerIcon,
  ChartPieIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { listAccountsDetail } from "../../api/account";
import { Account } from "../../rustTypes/Account";
import { valueFormatter } from "../../common/ValueFormatter";
import { Link, useNavigate } from "react-router-dom";
import { navContext } from "../../common/NavProvider";
import { create } from "zustand";

interface AccountCardProps {
  account: Account;
}

type AccountSelectionStore = {
  selectedAccounts: string[];
  addAccount: (account: string) => void;
  removeAccount: (account: string) => void;
};

export const useAccountSelectionStore = create<AccountSelectionStore>(
  (set) => ({
    selectedAccounts: [],
    addAccount: (account) =>
      set((state) => ({
        selectedAccounts: [...state.selectedAccounts, account],
      })),
    removeAccount: (account) =>
      set((state) => ({
        selectedAccounts: state.selectedAccounts.filter((a) => a !== account),
      })),
  }),
);

const AccountCard: React.FC<AccountCardProps> = ({ account }) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [isSelected, setIsSelected] = React.useState<boolean>(false);
  const { name, cash_flows } = account;
  const navigate = useNavigate();
  const { addAccount, removeAccount, selectedAccounts } =
    useAccountSelectionStore();

  useEffect(() => {
    if (selectedAccounts.includes(name)) {
      setIsSelected(true);
    }
  }, []);

  return (
    <div className="w-full p-1 md:w-1/2 lg:w-4/12 xl:w-3/12">
      <Card
        decoration={isSelected && "left"}
        onClick={() => {
          setIsSelected(!isSelected);
          if (isSelected) {
            removeAccount(name);
          } else {
            addAccount(name);
          }
        }}
        decorationColor={"green"}
        className={`
        cursor-pointer
        hover:bg-tremor-background-muted  active:bg-tremor-background-subtle 
        md:min-h-[125px] 
        hover:dark:bg-dark-tremor-background-muted active:dark:bg-dark-tremor-background-subtle
        `}
      >
        <div className="flex flex-row justify-between align-top">
          <Title>{name}</Title>
          <div className="flex flex-row gap-2">
            <Button
              tooltip="View Account Forecast"
              variant="light"
              icon={BeakerIcon}
              iconPosition="right"
              color="slate"
              onClick={() => navigate(`/account/budget/${account.name}`)}
            />
            <Button
              tooltip="Edit Account"
              variant="light"
              icon={Cog6ToothIcon}
              color="slate"
              onClick={() => navigate(`/account/${account.name}`)}
            />
          </div>
        </div>
        <Text>
          {account.start_date} - {account.end_date}
        </Text>
        <Divider>Cash Flows</Divider>
        <div className="h-[60px]">
          <div className="flex max-h-[60px] flex-row flex-wrap justify-end gap-2 overflow-y-clip">
            {cash_flows.slice(0, 3).map((cf, i) => (
              <Badge color={cf.amount > 0 ? "green" : "red"} key={i}>
                {cf.name}
              </Badge>
            ))}
            {cash_flows.length > 3 ? (
              <Button
                variant="light"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsOpen(true);
                }}
              >
                And {cash_flows.length - 3} more...
              </Button>
            ) : null}
          </div>
        </div>
      </Card>
      <Dialog open={isOpen} onClose={(val) => setIsOpen(val)} static={true}>
        <DialogPanel>
          <Title>{name}</Title>
          <Subtitle>Cash Flows Summery</Subtitle>
          <Table className="max-h-[35vh] cursor-default overflow-y-scroll">
            <TableHead>
              <TableRow>
                <TableHeaderCell className="m-0 p-0 pl-3 pt-4">
                  Name
                </TableHeaderCell>
                <TableHeaderCell className="m-0 p-0">Amount</TableHeaderCell>
                <TableHeaderCell className="m-0 p-0">Frequency</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cash_flows.map((cf, i) => (
                <TableRow
                  key={i}
                  className={`${i % 2 == 0 ? "bg-tremor-background-subtle dark:bg-dark-tremor-background-subtle" : ""}`}
                >
                  <TableCell className="m-0 p-0 py-1 pl-3">
                    <Link to={`/account/${account.name}?next=${i}`}>
                      {cf.name}
                    </Link>
                  </TableCell>
                  <TableCell className="m-0 p-0">
                    {valueFormatter(cf.amount)}
                  </TableCell>
                  <TableCell className="m-0 p-0">{cf.frequency}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-3">
            <Button variant="light" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </DialogPanel>
      </Dialog>
    </div>
  );
};

const RunScenarioButton: React.FC = () => {
  const navigate = useNavigate();
  const { selectedAccounts } = useAccountSelectionStore();

  const accounts = new URLSearchParams();
  accounts.append("accounts", selectedAccounts.join(","));

  return (
    <Button
      variant="light"
      icon={ChartPieIcon}
      iconPosition="right"
      onClick={() => {
        navigate("/scenario?" + accounts.toString());
      }}
    >
      Scenario Forecast
    </Button>
  );
};

const Home: React.FC = () => {
  const [accounts, setAccounts] = React.useState<Account[]>([]);
  useEffect(() => {
    listAccountsDetail().then((data) => {
      setAccounts(data);
    });
  }, []);

  const { setAuxButtons } = useContext(navContext);
  useEffect(() => {
    setAuxButtons && setAuxButtons(<RunScenarioButton />);
    return () => {
      setAuxButtons && setAuxButtons(null);
    };
  }, [setAuxButtons]);

  return (
    <div className="flex w-full flex-row flex-wrap">
      {accounts.map((account, i) => (
        <AccountCard account={account} key={i} />
      ))}
    </div>
  );
};

export default Home;
