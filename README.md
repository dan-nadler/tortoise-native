# The Tortoise (Native)

This is an expansion and port of https://thetortoise.io into a native application.

![The Tortoise (Native)](https://github.com/Tortoise-Technologies/tortoise-native/blob/main/assets/WIP%20Screenshot.png?raw=true)

![The Tortoise (Native)](https://github.com/Tortoise-Technologies/tortoise-native/blob/main/assets/Scenario%20Creation.png?raw=true)

This is currently under development and not ready for general use.

That said, if you'd like to play with it, you can add a scenario by creating a `~/.tortoise` directory and adding an account `yaml` file. 
The json schema for this file at [src-tauri/src/schemas/.account.json](src-tauri/src/schemas/.account.json). This will allow you to 
do simple budget forecasting by defining recurring or one-time cashflows into and out of an account.

## Roadmap
- [x] ~Define portfolios to use with accounts~ ✅
- [ ] Basic portfolio management and investment forecasts
    - [x] ~Define portfolio YAMLs~ ✅
    - [x] ~Integrate investment returns into budget~ ✅
    - [ ] Create a long-term investment forecast dashboard
- [ ] Monte carlo forecasting
    - [x] ~Vectorize the budget and investment algorithms~ ✅
    - [ ] Return and display distribution information


# Created with Tauri + React + Typescript
## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
