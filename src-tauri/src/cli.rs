mod api;
mod sim;
use std::process::exit;

fn generate_json_schemas() {
    use schemars::schema_for;

    let schematize_objs = vec![
        (schema_for!(sim::cash::Account), ".account.json"),
        (schema_for!(sim::cash::Payment), ".payment.json"),
        (schema_for!(sim::portfolio::Asset), ".asset.json"),
        (schema_for!(sim::portfolio::Portfolio), ".portfolio.json"),
    ];

    for obj in schematize_objs {
        let schema = obj.0;
        let ser = serde_json::to_string_pretty(&schema).unwrap();
        std::fs::write(format!("src/schemas/{}", obj.1), ser).unwrap();
    }
}

fn main() {
    // parse command line args
    let args: Vec<String> = std::env::args().collect();

    // flag to run the API server
    let run_api = args.contains(&String::from("--run-api"));
    if run_api {
        let _ = api::main();
        exit(0);
    }

    // flag to generate json schema
    let gen_schema = args.contains(&String::from("--gen-schema"));

    // run simulation with provided config
    let run_sim = args.contains(&String::from("--run-sim"));
    let config_file = args.iter().position(|s| s == "--config");
    let mut config = String::new();

    // Optional Portfolio conifguration
    let portfolio_file = args.iter().position(|s| s == "--portfolio");
    let mut portfolio: Option<sim::portfolio::Portfolio> = None;

    // let num_samples_arg = args.iter().position(|s| s == "--num-samples");
    // let mut num_samples: i64 = 1;

    // if num_samples_arg.is_some() {
    //     let num_samples_arg = num_samples_arg.unwrap();
    //     let num_samples_str = &args[num_samples_arg + 1];
    //     num_samples = num_samples_str.parse::<i64>().unwrap_or(1);
    // }

    // Output to excel file
    let excel = args.contains(&String::from("--excel"));
    let excel_file = args.iter().position(|s| s == "--excel");

    if config_file.is_some() {
        let config_file = config_file.unwrap();
        let config_file = &args[config_file + 1];
        config = std::fs::read_to_string(config_file).unwrap();
    }

    if portfolio_file.is_some() {
        let portfolio_file = portfolio_file.unwrap();
        let portfolio_file = &args[portfolio_file + 1];
        let portfolio_config = std::fs::read_to_string(portfolio_file).unwrap();
        portfolio = Some(serde_yaml::from_str(&portfolio_config).unwrap());
    }

    if run_sim {
        if config_file.is_none() {
            println!("--run-sim requires --config <config_file>");
            exit(1)
        }
        let account: sim::cash::Account = serde_yaml::from_str(&config).unwrap();
        let results = sim::run_simulation(account, portfolio, true);

        if excel {
            if excel_file.is_none() {
                println!("--excel requires --excel <excel_file>");
                exit(1)
            }
            let excel_file = excel_file.unwrap();
            let excel_file = &args[excel_file + 1];
            sim::excel::write_sim(results, excel_file);
        }
    }

    if gen_schema {
        generate_json_schemas();
        exit(0)
    }

    exit(0)
}

#[test]
fn yaml_to_json() {
    let path = "scenarios/default/addition_only_account";
    let yaml_path = format!("{}.yaml", path);
    let json_path = format!("{}.json", path);

    let yaml = std::fs::read_to_string(yaml_path).unwrap();
    let account: sim::cash::Account = serde_yaml::from_str(&yaml).unwrap();
    let json = serde_json::to_string_pretty(&account).unwrap();
    std::fs::write(json_path, json).unwrap();
}
