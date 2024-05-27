import { Grid, Title } from "@tremor/react";
import React, { useEffect } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { getFilePath } from "../../api/import";
import { readFile } from "@tauri-apps/plugin-fs";

const Main: React.FC = () => {
  useEffect(() => {
    getFilePath().then(readFile).then(console.log);
  }, []);

  return (
    <Grid className="min-h-dvh bg-tremor-background px-4 py-2 dark:bg-dark-tremor-background">
      <div className="flex flex-col items-center justify-start">
        <Title>Import Account</Title>
      </div>
    </Grid>
  );
};

const ImportAccount: React.FC = () => {
  return (
    <MemoryRouter>
      <Routes>
        <Route path="" Component={Main} />
      </Routes>
    </MemoryRouter>
  );
};

export default ImportAccount;
