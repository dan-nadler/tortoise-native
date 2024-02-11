const stringFormatter = (number: number) => {
  const rounded = Math.round(number * 10) / 10;
  return "$" + new Intl.NumberFormat("us").format(rounded).toString();
};

// Replaces the dollar amount with Xs. For example, $1,000 becomes $X,XXX
// and $1,000,000 becomes $X,XXX,XXX
const anonymizeFormatter = (number: number) => {
  return stringFormatter(number).replace(/\d/g, "X");
};

export const valueFormatter = (number: number, anon: boolean = false) => {
  let fmt = anon === true ? anonymizeFormatter : stringFormatter;

  const num = Math.abs(number);
  if (num < 1_000) {
    return fmt(num);
  } else if (num < 1_000_000) {
    return fmt(num / 1_000) + " K";
  } else if (num < 1_000_000_000) {
    return fmt(num / 1_000_000) + " M";
  } else {
    return fmt(num / 1_000_000_000) + " B";
  }
};
