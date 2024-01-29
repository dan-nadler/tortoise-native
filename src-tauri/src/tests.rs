#[test]
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
