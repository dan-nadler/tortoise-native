import React, { useContext, useEffect, useLayoutEffect } from "react";
import {
  Text,
  TextInput,
  Card,
  Grid,
  BadgeDelta,
  Flex,
  Title,
  Button,
  Divider,
  Icon,
  NumberInput,
  Dialog,
  DialogPanel,
} from "@tremor/react";
import { useAccountStore } from "../../../store/Account";
import { CashFlow } from "../../../rustTypes/CashFlow";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { PlusIcon } from "@heroicons/react/24/solid";
import { deleteAccount, getAccount, saveAccount } from "../../../api/account";
import Tag from "../../../common/Tag";
import { useDebouncedCallback } from "use-debounce";

const frequencyToShortString = (frequency: string): string => {
  switch (frequency) {
    case "Once":
      return "One time";
    case "MonthStart":
      return " Monthly (SOM)";
    case "MonthEnd":
      return " Monthly (EOM)";
    case "SemiMonthly":
      return " Semi-monthly";
    case "Annually":
      return " Annually";
    default:
      return "Unknown";
  }
};

const AccountForm: React.FC = () => {
  const {
    name,
    start_date,
    end_date,
    setName,
    setStartDate,
    setEndDate,
    balance,
    setBalance,
  } = useAccountStore();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-grow flex-row">
        <div className="flex-grow">
          <Text className="text-sm text-gray-600">Account Name</Text>
          <TextInput value={name} onChange={(e) => setName(e.target.value)} />
        </div>
      </div>
      <div className="flex flex-grow flex-row gap-2">
        <div className="flex-grow">
          <Text className="text-sm text-gray-600">Start Date</Text>
          <TextInput
            value={start_date}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex-grow">
          <Text className="text-sm text-gray-600">End Date</Text>
          <TextInput
            value={end_date}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-grow flex-row gap-2">
        <div className="flex-grow">
          <Text className="text-sm text-gray-600">Starting Balance</Text>
          <NumberInput
            value={balance}
            onChange={(e) => setBalance(parseFloat(e.target.value ?? ""))}
          />
        </div>
      </div>
    </div>
  );
};

// A function that formats numbers, adding commas and dollar signs. If negative, the "-" appears before the "$".
function formatNumber(num: number) {
  return (num < 0 ? "-$" : "$") + Math.abs(num).toLocaleString();
}

const CashFlowCard: React.FC<{
  scenarioName: string;
  item: CashFlow;
  i: number;
}> = ({ scenarioName, item, i }) => {
  const navigate = useNavigate();
  return (
    <Card
      className={`flex flex-col flex-wrap py-4 hover:cursor-pointer 
      hover:bg-tremor-background-muted active:bg-tremor-background-subtle
      dark:hover:bg-dark-tremor-background-muted dark:active:bg-dark-tremor-background-subtle`}
      color="neutral"
      onClick={() => navigate(`/account/${scenarioName}/${i}`)}
    >
      <Flex
        justifyContent="between"
        alignItems="baseline"
        className="flex-wrap truncate pb-2"
      >
        <Flex flexDirection="col" className="w-auto" alignItems="start">
          <Title>{item.name}</Title>
          <Flex flexDirection="row" alignItems="start" className="w-auto gap-1">
            <Text>{frequencyToShortString(item.frequency)}</Text>
            {item.start_date && !item.end_date && (
              <Text>{item.frequency !== "Once" ? "starting" : "on"}</Text>
            )}
            {item.start_date && <Text>{item.start_date}</Text>}
            {item.start_date && item.end_date && <Text>-</Text>}
            {item.end_date && !item.start_date && <Text>ending&</Text>}
            {item.end_date && <Text>{item.end_date}</Text>}
          </Flex>
        </Flex>
        <Flex flexDirection="row" className="w-auto">
          <BadgeDelta
            size={"lg"}
            deltaType={
              item.amount > 0
                ? "moderateIncrease"
                : item.amount == 0
                  ? "unchanged"
                  : "moderateDecrease"
            }
            tooltip={item.tax_rate ? `${item.tax_rate * 100}% tax` : "No tax"}
          >
            {formatNumber(item.amount)}
          </BadgeDelta>
        </Flex>
      </Flex>
      <Flex
        flexDirection="row"
        justifyContent="end"
        alignItems="end"
        className="flex-grow gap-2"
      >
        {item.tags?.map((tag, i) => <Tag key={i} tag={tag} />)}
      </Flex>
    </Card>
  );
};

const CashFlowCards: React.FC = () => {
  const { cash_flows, addCashFlow, name } = useAccountStore();
  const navigate = useNavigate();

  return (
    <Grid numItemsSm={2} numItemsLg={3} className="gap-2">
      {cash_flows.map((item, i) => (
        <CashFlowCard key={i} scenarioName={name} item={item} i={i} />
      ))}
      <Card
        className={`flex cursor-pointer flex-col flex-wrap py-4 
        hover:bg-tremor-background-muted active:bg-tremor-background-subtle
      dark:hover:bg-dark-tremor-background-muted dark:active:bg-dark-tremor-background-subtle`}
        color="gray"
        onClick={() => {
          addCashFlow({
            name: "New Cash Flow",
            amount: 0,
            frequency: "MonthStart",
            tax_rate: 0,
            start_date: null,
            end_date: null,
            tags: [],
          });
          navigate(`/account/${name}/${cash_flows.length}`);
        }}
      >
        <div className="m-auto flex h-full flex-row items-center">
          <Icon icon={PlusIcon} color="slate" size="lg" />
          <Title color={"slate"}>Add Cash Flow</Title>
        </div>
      </Card>
    </Grid>
  );
};

const Main: React.FC = () => {
  const state = useAccountStore();
  const { name } = useParams<{ name: string }>();
  const [searchParams, _] = useSearchParams();
  const navigate = useNavigate();
  const [deleteIsOpen, setDeleteIsOpen] = React.useState(false);

  useLayoutEffect(() => {
    if (name) {
      getAccount(name)
        .then((a) => {
          state.setAll(a);
        })
        .then(() => {
          if (searchParams.has("next")) {
            let i = searchParams.get("next");
            if (i) navigate(`/account/${name}/${i}`);
          }
        });
    }
  }, [name]);

  // Save every `timeout` seconds at most. Otherwise, will save on unmount due to the `flush` call in the cleanup function.
  let save = useDebouncedCallback((state) => {
    saveAccount(state);
  }, 30_000);

  useEffect(() => {
    let unsub = useAccountStore.subscribe(save);

    return () => {
      unsub();
      save.flush();
    };
  }, []);

  return (
    <div>
      <div className="flex flex-col gap-2">
        <AccountForm />
        <Divider>Cash Flows</Divider>
        <CashFlowCards />
        <Divider>Danger</Divider>
        <Button
          className="w-full max-w-[720px] m-auto"
          disabled={!name}
          color="red"
          onClick={() => setDeleteIsOpen(!deleteIsOpen)}
        >
          Delete
        </Button>
        <Dialog
          open={deleteIsOpen}
          onClose={() => setDeleteIsOpen(false)}
          static={true}
          className="z-[100]"
        >
          <DialogPanel className="flex max-w-lg flex-col">
            <Title>Are you sure you want to delete this account?</Title>
            <Divider />
            <div className="flex flex-row">
              <Button
                variant="primary"
                size="xl"
                color="red"
                className="mx-auto flex items-center"
                onClick={() =>
                  deleteAccount(name!).then(() => {
                    state.reset();
                    save.cancel();
                    navigate("/");
                  })
                }
              >
                Delete
              </Button>
              <Button
                variant="secondary"
                color="slate"
                size="xl"
                className="mx-auto flex items-center"
                onClick={() => setDeleteIsOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </DialogPanel>
        </Dialog>
      </div>
    </div>
  );
};

export default Main;
