import { Card, Title, Divider, Badge, Subtitle, Button } from "@tremor/react";
import React from "react";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";

const AccountCard: React.FC = () => {
  return (
    <div className="w-full p-1 md:w-1/2 lg:w-4/12 xl:w-3/12">
      <Card className="md:min-h-[125px]">
        <div className="flex flex-row justify-between align-top">
          <Title>Account Name</Title>
          <Button variant="light" icon={Cog6ToothIcon} color="slate"/>
        </div>
        <Subtitle>YYYY-MM-DD - YYYY-MM-DD</Subtitle>
        <Divider>Cash Flows</Divider>
        <div className="flex flex-row flex-wrap justify-end gap-2">
          <Badge color="red">Lorem</Badge>
          <Badge color="red">Sit</Badge>
          <Badge color="green">Amet</Badge>
          <Badge color="orange">Cash Flow</Badge>
          <Badge color="green">Consectetur</Badge>
          <Badge color="green">Cash Flow</Badge>
        </div>
      </Card>
    </div>
  );
};

const Home: React.FC = () => {
  return (
    <div className="flex w-full flex-row flex-wrap">
      <AccountCard />
      <AccountCard />
      <AccountCard />
      <AccountCard />
      <AccountCard />
      <AccountCard />
      <AccountCard />
      <AccountCard />
      <AccountCard />
      <AccountCard />
      <AccountCard />
      <AccountCard />
    </div>
  );
};

export default Home;
