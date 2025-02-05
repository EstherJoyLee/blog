"use client";

import { Provider } from "react-redux";
import store from "./slice/store";
import CheckIsOwnerProvider from "@/components/checkIsOwner/CheckIsOwner";
import { ThemeProvider } from "next-themes";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="system">
        <CheckIsOwnerProvider>{children}</CheckIsOwnerProvider>
      </ThemeProvider>
    </Provider>
  );
};

export default Providers;
