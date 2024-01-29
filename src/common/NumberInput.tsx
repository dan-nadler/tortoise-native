import { NumberInput, NumberInputProps } from "@tremor/react";
import React, { useState } from "react";

// Instead of using onChange, this wraps the NumberInput and uses onBlur to
// more gracefully handle inputs like "-" which are not valid initially, but
// are valid after the user has finished typing.
const MyNumberInput: React.FC<NumberInputProps> = (props) => {
  const [value, setValue] = useState<string>(props.value?.toString() ?? "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  return (
    <NumberInput
      {...props}
      value={value}
      onBlur={props.onChange}
      onChange={handleChange}
    />
  );
};

export default MyNumberInput;
