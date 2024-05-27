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
import React, { useEffect, useLayoutEffect } from "react";
import {
  ChartBarIcon,
  Cog6ToothIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { listAccountsDetail, saveAccount } from "../../../api/account";
import { Account } from "../../../rustTypes/Account";
import { valueFormatter } from "../../../common/ValueFormatter";
import { Link, useNavigate } from "react-router-dom";
import { useAccountSelectionStore } from "./Store";
import dayjs from "dayjs";

interface AccountCardProps {
  account: Account;
}

const CreateAccountCard: React.FC<AccountCardProps> = ({ account }) => {
  const navigate = useNavigate();

  return (
    <div className="flex w-full justify-center p-1 md:w-1/2 lg:w-4/12 xl:w-3/12">
      <Button
        className={`flex-grow border-slate-200 hover:bg-slate-200
        active:bg-tremor-background-subtle dark:border-slate-800
        hover:dark:bg-slate-800 active:dark:bg-dark-tremor-background-subtle`}
        variant="secondary"
        icon={PlusIcon}
        color="slate"
        onClick={() => {
          saveAccount(account).then(() => {
            navigate(`/account/${account.name}`);
          });
        }}
      >
        Create New Scenario
      </Button>
    </div>
  );
};

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
              icon={ChartBarIcon}
              iconPosition="right"
              color="slate"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/account/budget/${account.name}`);
              }}
            />
            <Button
              tooltip="Edit Account"
              variant="light"
              icon={Cog6ToothIcon}
              color="slate"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/account/${account.name}`);
              }}
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

const Home: React.FC = () => {
  const [accounts, setAccounts] = React.useState<Account[]>([]);
  useLayoutEffect(() => {
    // the timeout is to mitigate a race condition when landing here after editing or creating an account
    // without this timeout, the list of accounts may not include the new or edited account
    setTimeout(() => {
      listAccountsDetail().then((data) => {
        setAccounts(data);
      });
    }, 100);
  }, []);

  return (
    <div className="flex w-full flex-row flex-wrap">
      {accounts.map((account, i) => (
        <AccountCard account={account} key={i} />
      ))}
      <CreateAccountCard
        account={{
          name: "New Scenario",
          balance: 0,
          cash_flows: [],
          start_date: dayjs().format("YYYY-MM-DD"),
          end_date: dayjs().format("YYYY-MM-DD"),
        }}
        key={accounts.length + 1}
      />
    </div>
  );
};

export default Home;
