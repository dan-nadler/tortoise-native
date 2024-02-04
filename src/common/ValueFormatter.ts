const stringFormatter = (number: number) => {
  return "$ " + new Intl.NumberFormat("us").format(number).toString();
};

export const valueFormatter = (number: number) => {
  const num = Math.abs(number);
  if (num < 10_000) {
    return stringFormatter(num);
  } else if (num < 10_000_000) {
    return stringFormatter(num / 1_000) + "K";
  } else if (num < 10_000_000_000) {
    return stringFormatter(num / 1_000_000) + "M";
  } else {
    return stringFormatter(num / 10_000_000_000) + "B";
  }
};
