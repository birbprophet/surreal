import React from "react";
import App from "next/app";
import { Provider } from "react-redux";
import { ReactReduxFirebaseProvider } from "react-redux-firebase";

import { store, rrfProps } from "../scripts/reduxFirebaseStore";
import AppLayout from "../components/AppLayout";

import Div100vh from "react-div-100vh";

import "../css/tailwind.css";
import "../css/styles.css";
import "typeface-asap";

class NextApp extends App {
  render() {
    const { Component: Page, pageProps, router } = this.props;

    return (
      <Provider store={store}>
        <ReactReduxFirebaseProvider {...rrfProps}>
          {["/", "/login", "/welcome"].includes(router.pathname) ? (
            <Div100vh>
              <Page {...pageProps}></Page>
            </Div100vh>
          ) : (
            <Div100vh>
              <AppLayout routerPath={router.pathname}>
                <Page {...pageProps}></Page>
              </AppLayout>
            </Div100vh>
          )}
        </ReactReduxFirebaseProvider>
      </Provider>
    );
  }
}

export default NextApp;
