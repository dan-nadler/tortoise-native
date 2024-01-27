import React, { useEffect, useState } from 'react';
import { Text, TextInput, Card, Badge, Grid, BadgeDelta, Flex, Title } from '@tremor/react';
import { useStore } from '../store/Account';
import AccountSelect from "../common/Select";
import { invoke } from '@tauri-apps/api';
import { Account } from '../rustTypes/Account';
import Nav from '../Nav';

const frequencyToShortString = (frequency: string): string => {
    switch (frequency) {
        case 'Once':
            return 'One time';
        case 'MonthStart':
            return ' Monthly (SOM)';
        case 'MonthEnd':
            return ' Monthly (EOM)';
        case 'SemiMonthly':
            return ' Semi-monthly';
        case 'Annually':
            return ' Annually';
        default:
            return 'Unknown';
    }
}

const AccountForm: React.FC = () => {
    const { name, start_date, end_date, setName, setStartDate, setEndDate } = useStore();

    return <div className='flex flex-row gap-2'>
        <div className="flex flex-row flex-grow">
            <div className='flex-grow'>
                <label className='text-sm text-gray-600'>Account Name</label>
                <TextInput value={name} onChange={(e) => setName(e.target.value)} />
            </div>
        </div>
        <div className="flex flex-row flex-grow gap-2">
            <div className='flex-grow'>
                <label className='text-sm text-gray-600'>Start Date</label>
                <TextInput value={start_date} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className='flex-grow'>
                <label className='text-sm text-gray-600'>End Date</label>
                <TextInput value={end_date} onChange={(e) => setEndDate(e.target.value)} />
            </div>
        </div>
    </div>
}

// const CashFlowForm: React.FC<{ index: number }> = ({ index }) => {
//     const {
//         setCashFlowName,
//         setCashFlowAmount,
//         cash_flows
//     } = useStore();
//     return <div className='flex flex-row gap-2'>
//         <div className="flex flex-col gap-2">
//             <div>
//                 <label className='text-sm text-gray-600'>Name</label>
//                 <TextInput
//                     value={cash_flows[index].name ?? undefined}
//                     onChange={(e) => setCashFlowName(index, e.target.value)} />
//             </div>
//             <div>
//                 <label className='text-sm text-gray-600'>Amount</label>
//                 <NumberInput
//                     value={cash_flows[index].amount ?? undefined}
//                     onChange={(e) => setCashFlowAmount(index, parseFloat(e.target.value))} />
//             </div>
//         </div>
//         <div className="flex flex-col gap-2">
//             <div>
//                 <label className='text-sm text-gray-600'>Frequency</label>
//                 <Select defaultValue='Annually'>
//                     <SelectItem value='Once'>Once</SelectItem>
//                     <SelectItem value='MonthStart'>Month Start</SelectItem>
//                     <SelectItem value='MonthEnd'>Month End</SelectItem>
//                     <SelectItem value='SemiMonthly'>Semi-Monthly</SelectItem>
//                     <SelectItem value='Annually'>Annually</SelectItem>
//                 </Select>
//             </div>
//         </div>
//     </div>
// }

// A function that formats numbers, adding commas and dollar signs. If negative, the "-" appears before the "$".
function formatNumber(num: number) {
    return (num < 0 ? '-$' : '$') + Math.abs(num).toLocaleString();
}

const CashFlowCards: React.FC = () => {
    const { cash_flows } = useStore();
    return <Grid numItemsSm={2} numItemsLg={3} className="gap-2">
        {cash_flows.map((item, i) => (
            <Card key={i} className='py-4 flex flex-col'>
                <Flex justifyContent="between" alignItems="baseline" className="truncate pb-2 flex-wrap">
                    <Flex flexDirection='col' className='w-auto' alignItems='start'>
                        <Title>{item.name}</Title>
                        <Flex flexDirection='row' alignItems='start' className='w-auto gap-1'>
                            <Text>{frequencyToShortString(item.frequency)}</Text>

                            {(item.start_date && !item.end_date) && <Text>{item.frequency !== 'Once' ? "starting" : "on"}</Text>}
                            {item.start_date && <Text>{item.start_date}</Text>}

                            {item.start_date && item.end_date && <Text>-</Text>}

                            {(item.end_date && !item.start_date) && <Text>ending&</Text>}
                            {item.end_date && <Text>{item.end_date}</Text>}
                        </Flex>
                    </Flex>
                    <Flex flexDirection='row' className='w-auto'>
                        <BadgeDelta
                            size={'lg'}
                            deltaType={item.amount > 0 ? 'moderateIncrease' : 'moderateDecrease'}
                            tooltip={item.tax_rate ? `${item.tax_rate * 100}% tax` : 'No tax'}>
                            {formatNumber(item.amount)}
                        </BadgeDelta>
                    </Flex>
                </Flex>
                <Flex flexDirection='row' justifyContent='end' alignItems='end' className='flex-grow gap-2'>
                    {item.tags?.map((tag, i) => <Badge key={i}>#{tag}</Badge>)}
                </Flex>
            </Card>
        ))}
    </Grid>
}

const Main: React.FC = () => {
    const [availableScenarios, setAvailableScenarios] = useState<string[]>([]);
    const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
    const [isRunning, _] = useState<boolean>(false);
    const { setAll } = useStore();

    async function listAvailableScenarios() {
        let x = await invoke<string>("list_available_scenarios");
        let j: string[] = JSON.parse(x);
        setAvailableScenarios(j);
    }

    useEffect(() => {
        listAvailableScenarios();
    }, []);

    async function loadScenario() {
        let a = await invoke<string>("get_account_config", { accountFilename: selectedScenario });
        let b: Account = JSON.parse(a);
        console.log(b)
        setAll(b);
    }

    return <div>
        <Nav subtitle="Scenario" path="/scenario" />
        <div className='flex flex-col gap-2'>
            <AccountSelect
                message="Select a scenario"
                availableScenarios={availableScenarios}
                selectedScenario={selectedScenario}
                setSelectedScenario={setSelectedScenario}
                isRunning={isRunning}
                run={loadScenario}
                runText={'Load'}
            />
            <AccountForm />
            <h3 className='text-lg'>Cash Flows</h3>
            <div>
                <CashFlowCards />
            </div>
        </div>
    </div>
}

export default Main;