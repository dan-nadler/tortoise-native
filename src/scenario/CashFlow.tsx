import {
  TextInput,
  Select,
  SelectItem,
  Button,
  Text,
  Divider,
} from "@tremor/react";
import React, { useEffect } from "react";
import { useAccountStore } from "../store/Account";
import { useParams, useNavigate } from "react-router-dom";
import MyNumberInput from "../common/NumberInput";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import MyTagsInput from "../common/TagsInput";
import { Frequency } from "../rustTypes/Frequency";

const CashFlowForm: React.FC = () => {
  const navigate = useNavigate();
  const { index } = useParams<{ index: string }>();

  if (index === undefined) {
    return <div>Invalid index</div>;
  }

  const i = parseInt(index);
  const {
    setCashFlowName,
    setCashFlowAmount,
    setCashFlowTaxRate,
    setCashFlowStartDate,
    setCashFlowEndDate,
    setCashFlowTags,
    setCashFlowFrequency,
    removeCashFlowTag,
    removeCashFlowIndex,
    cash_flows,
  } = useAccountStore();

  const [amountError, setAmountError] = React.useState<boolean>(false);
  const [taxError, setTaxError] = React.useState<boolean>(false);

  useEffect(() => {
    if (
      isNaN(cash_flows[i].amount) ||
      cash_flows[i].amount === undefined ||
      cash_flows[i].amount === null
    ) {
      setAmountError(true);
    } else {
      setAmountError(false);
    }
  }, [cash_flows[i].amount]);

  useEffect(() => {
    if (
      isNaN(cash_flows[i].tax_rate) ||
      cash_flows[i].tax_rate === undefined ||
      cash_flows[i].tax_rate === null ||
      cash_flows[i].tax_rate < 0 ||
      cash_flows[i].tax_rate > 1
    ) {
      setTaxError(true);
    } else {
      setTaxError(false);
    }
  }, [cash_flows[i].tax_rate]);

  return (
    <>
      <form
        className="h-min-dvh m-auto mt-10 flex max-w-[800px] flex-col justify-start gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          navigate("/scenario");
        }}
      >
        <div className="flex w-full flex-col gap-2">
          <div className="flex flex-row gap-2">
            <Button
              size="xl"
              icon={ArrowLeftIcon}
              type="reset"
              variant="light"
              onClick={() => navigate(`/scenario`)}
            >
              Back
            </Button>
          </div>
          <Divider>Edit Cash Flow</Divider>
          <div className="flex flex-row gap-2">
            <div className="flex-grow">
              <Text>Name</Text>
              <TextInput
                value={cash_flows[i].name ?? undefined}
                onChange={(e) => setCashFlowName(i, e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-row flex-wrap gap-2">
            <div className="flex-grow-[10]">
              <Text>Amount</Text>
              <MyNumberInput
                min={undefined}
                max={undefined}
                error={amountError}
                value={cash_flows[i].amount ?? undefined}
                enableStepper={false}
                onChange={(e) =>
                  setCashFlowAmount(i, parseFloat(e.target.value))
                }
              />
            </div>
            <div className="flex flex-grow-[1] flex-col gap-2">
              <div className="flex-grow">
                <Text>Frequency</Text>
                <Select
                  value={cash_flows[i].frequency ?? "MonthStart"}
                  onValueChange={(e) => setCashFlowFrequency(i, e as Frequency)}
                >
                  <SelectItem value="Once">Once</SelectItem>
                  <SelectItem value="MonthStart">Month Start</SelectItem>
                  <SelectItem value="MonthEnd">Month End</SelectItem>
                  <SelectItem value="SemiMonthly">Semi-Monthly</SelectItem>
                  <SelectItem value="Annually">Annually</SelectItem>
                </Select>
              </div>
            </div>
            <div className="flex-grow-[1]">
              <Text>Tax Rate</Text>
              <MyNumberInput
                min={0}
                max={1}
                step={0.00000001} // a validation error occurs if the value is not a multiple of the step value
                error={taxError}
                errorMessage="Tax rate must be between 0 and 1."
                value={cash_flows[i].tax_rate ?? 0}
                enableStepper={false}
                onChange={(e) =>
                  setCashFlowTaxRate(i, parseFloat(e.target.value) ?? 0)
                }
              />
            </div>
          </div>
          <Divider>Effective Date Range (Optional)</Divider>
          <div className="flex flex-row flex-wrap gap-2">
            <div className="flex-grow">
              <Text>Start Date (YYYY-MM-DD)</Text>
              <TextInput
                placeholder="YYYY-MM-DD"
                value={cash_flows[i].start_date ?? undefined}
                onChange={(e) => setCashFlowStartDate(i, e.target.value)}
              />
            </div>
            <div className="flex-grow">
              <Text>End Date (YYYY-MM-DD)</Text>
              <TextInput
                placeholder="YYYY-MM-DD"
                value={cash_flows[i].end_date ?? undefined}
                onChange={(e) => setCashFlowEndDate(i, e.target.value)}
              />
            </div>
          </div>
          <Divider>Tags</Divider>
          <div className="flex flex-row gap-2">
            <MyTagsInput
              value={cash_flows[i].tags ?? []}
              onChange={(tags) => setCashFlowTags(i, tags)}
              onRemoveTag={(tag) => removeCashFlowTag(i, tag)}
            />
          </div>
        </div>
        <Divider />
        <Button type="submit" color="blue">
          Done
        </Button>
        <Button type="button" color="red" onClick={() => {
          removeCashFlowIndex(i);
          navigate("/scenario");
        }}>
          Delete
        </Button>
      </form>
    </>
  );
};

export default CashFlowForm;
