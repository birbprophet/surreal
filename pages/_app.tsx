import React from "react";
import App from "next/app";
import { Provider } from "react-redux";
import { ReactReduxFirebaseProvider } from "react-redux-firebase";

import { store, rrfProps } from "../scripts/reduxFirebaseStore";
import AppLayout from "../components/AppLayout";

class NextApp extends App {
  render() {
    const { Component, pageProps, router } = this.props;

    return (
      <Provider store={store}>
        <ReactReduxFirebaseProvider {...rrfProps}>
          {router.pathname.startsWith("/login") ? (
            <Component {...pageProps}></Component>
          ) : (
            <AppLayout>
              <Component {...pageProps}></Component>
            </AppLayout>
          )}
        </ReactReduxFirebaseProvider>
      </Provider>
    );
  }
}

export default NextApp;
