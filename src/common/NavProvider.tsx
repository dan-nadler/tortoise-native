import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
} from "react";

export const navContext = createContext<{
  auxButtons?: React.ReactNode;
  setAuxButtons?: Dispatch<SetStateAction<ReactNode>>;
}>({});
