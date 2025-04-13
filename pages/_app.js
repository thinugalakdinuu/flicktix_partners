import "@/styles/globals.css";
import { Toaster } from "react-hot-toast";
import { StateContextProvider } from "@/context/StateContext";

export default function App({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => page);

  return (
    <StateContextProvider>
      {getLayout(
        <>
          <Component {...pageProps} />
          <Toaster />
        </>
      )}
    </StateContextProvider>
  );
}
