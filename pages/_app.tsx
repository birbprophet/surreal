import React from "react";
import App from "next/app";
import { Provider } from "react-redux";
import { ReactReduxFirebaseProvider } from "react-redux-firebase";

import { store, rrfProps } from "../scripts/reduxFirebaseStore";
import AppLayout from "../components/AppLayout";

import "../css/tailwind.css";
import "../css/styles.css";

class NextApp extends App {
  render() {
    const { Component: Page, pageProps, router } = this.props;

    return (
      <Provider store={store}>
        <ReactReduxFirebaseProvider {...rrfProps}>
          {["/", "/login", "/welcome"].includes(router.pathname) ? (
            <Page {...pageProps}></Page>
          ) : (
            <AppLayout routerPath={router.pathname}>
              <Page {...pageProps}></Page>
            </AppLayout>
          )}
        </ReactReduxFirebaseProvider>
      </Provider>
    );
  }
}

export default NextApp;
