use xlsxwriter::prelude::*;

pub fn write_sim(results: super::SimulationResult, file: &str) {
    let workbook = Workbook::new(file).unwrap();
    write_account_balance(&workbook, &results);
    write_cash_flows(&workbook, &results);
    workbook.close().unwrap();
}

fn write_account_balance(workbook: &Workbook, results: &super::SimulationResult) {
    let mut sheet = workbook.add_worksheet(Some("Account Balance")).unwrap();
    sheet.write_string(0, 0, "Date", None).unwrap();
    sheet.write_string(0, 1, "Account", None).unwrap();
    sheet.write_string(0, 2, "Balance", None).unwrap();

    let mut row = 1;
    for b in &results.balances {
        sheet.write_datetime(row, 0, &b.date.into(), None).unwrap();
        sheet.write_string(row, 1, &b.account_name, None).unwrap();
        sheet.write_number(row, 2, b.balance, None).unwrap();
        row += 1;
    }
}

fn write_cash_flows(workbook: &Workbook, results: &super::SimulationResult) {
    let mut sheet = workbook.add_worksheet(Some("Cash Flows")).unwrap();
    sheet.write_string(0, 0, "Date", None).unwrap();
    sheet.write_string(0, 1, "Cash Flow", None).unwrap();
    sheet.write_string(0, 2, "Amount", None).unwrap();

    let mut row = 1;
    for f in &results.payments {
        let name = &f.cash_flow.name;
        sheet.write_datetime(row, 0, &f.date.into(), None).unwrap();
        sheet
            .write_string(row, 1, name.as_ref().unwrap(), None)
            .unwrap();
        sheet.write_number(row, 2, f.amount, None).unwrap();
        row += 1;
    }
}
