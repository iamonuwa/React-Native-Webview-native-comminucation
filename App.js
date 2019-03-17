/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from "react";
import { StyleSheet, Text, View } from "react-native";
import BurnerWebView from "./BurnerWebView";

export default class App extends Component {
  constructor(props) {
    super(props);
  }

  onLoad = event => {
    console.warn("Loaded ", event);
  };

  render() {
    return (
      <View style={styles.container}>
        <BurnerWebView
          ref={component => (this.webViewLeaflet = component)}
          onLoad={this.onLoad}
          eventReceiver={this} // the component that will receive map events
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#00ffff",

    display: "flex"
  }
});
