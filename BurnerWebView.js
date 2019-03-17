import React, { Component } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  WebView,
  Platform,
  Text,
  TouchableOpacity
} from "react-native";
import {
  CameraKitCameraScreen,
  CameraKitCamera,
  CameraKitGallery
} from "react-native-camera-kit";
const MESSAGE_PREFIX = "SENT_FROM_WEBSITE";
export default class BurnerWebView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      webviewErrorMessages: [],
      hasError: false,
      hasErrorMessage: "",
      hasErrorInfo: "",
      qrvalue: "",
      openScanner: false
    };
  }

  componentDidCatch(error, info) {
    // Display fallback UI
    this.setState({
      hasError: true,
      hasErrorMessage: error,
      hasErrorInfo: info
    });
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (!prevState.loaded && this.state.loaded) {
      this.doPostBurnerLoadedActions();
    }
  };

  doPostBurnerLoadedActions = () => {
    console.warn("Burner has been loaded");
  };

  sendMessage = payload => {
    if (this.state.loaded) {
      // only send message when webview is loaded

      const message = JSON.stringify({
        prefix: MESSAGE_PREFIX,
        payload
      });
      this.webview.postMessage(message, "*");
    }
  };

  handleMessage = data => {
    let msgData;
    msgData = JSON.parse(data);
    if (msgData.hasOwnProperty("prefix") && msgData.prefix === MESSAGE_PREFIX) {
      console.warn(`Webview: received message: `, msgData.payload);
      // this.onOpenScanner();
      // if we receive an event, then pass it to the parent by calling
      // the parent function wtith the same name as the event, and passing
      // the entire payload as a parameter
      // we can use switch...case statement if we have different payloads
    }
  };

  onError = error => {
    this.setState({
      webviewErrorMessages: [...this.state.webviewErrorMessages, error]
    });
  };

  renderError = error => {
    this.setState({
      webviewErrorMessages: [...this.state.webviewErrorMessages, error]
    });
  };

  onBarcodeScan(qrvalue) {
    //called after te successful scanning of QRCode/Barcode
    this.setState({ qrvalue: qrvalue, openScanner: false });
  }

  onBottomButtonPressed(event) {
    const captureImages = JSON.stringify(event.captureImages);
    this.sendMessage(event.captureImages);
    Alert.alert(
      `${event.type} button pressed`,
      `${captureImages}`,
      [{ text: "OK", onPress: () => console.log("OK Pressed") }],
      { cancelable: false }
    );
  }

  onOpenScanner = async () => {
    var that = this;
    //To Start Scanning
    if (Platform.OS === "android") {
      async function requestCameraPermission() {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: "CameraExample App Camera Permission",
              message: "CameraExample App needs access to your camera "
            }
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            //If CAMERA Permission is granted
            that.setState({ qrvalue: "" });
            that.setState({ openScanner: true });
          } else {
            alert("CAMERA permission denied");
          }
        } catch (err) {
          alert("Camera permission err", err);
        }
      }
      //Calling the camera permission function
      requestCameraPermission();
    } else {
      that.setState({ qrvalue: "" });
      that.setState({ openScanner: true });
    }
  };

  renderLoadingIndicator = () => {
    return (
      <View style={styles.activityOverlayStyle}>
        <View style={styles.activityIndicatorContainer}>
          <ActivityIndicator
            size="large"
            animating={!this.props.eventReceiver.state.mapsState.loaded}
          />
        </View>
      </View>
    );
  };

  renderWebView = () => {
    return (
      <View style={{ flex: 1, overflow: "hidden" }}>
        <WebView
          style={{
            ...StyleSheet.absoluteFillObject
          }}
          ref={ref => {
            this.webview = ref;
          }}
          //   source={{ uri: "https://xdai.io/" }}
          source={{ uri: "https://blooming-mountain-33740.herokuapp.com/" }}
          startInLoadingState={true}
          renderLoading={this.renderLoading}
          renderError={error => {
            console.warn("RENDER ERROR: ", error);
          }}
          javaScriptEnabled={true}
          onError={error => {
            console.warn("ERROR: ", error);
          }}
          scalesPageToFit={false}
          mixedContentMode={"always"}
          onMessage={event => {
            alert(event.nativeEvent, event.nativeEvent.data);
            if (event && event.nativeEvent && event.nativeEvent.data) {
              this.handleMessage(event.nativeEvent.data);
            }
          }}
          onLoadStart={() => {}}
          onLoadEnd={() => {
            if (this.props.eventReceiver.hasOwnProperty("onLoad")) {
              console.warn("loaded ", this.props.eventReceiver);
              this.props.eventReceiver.onLoad();
            }
            this.setState({ loaded: true });
          }}
          domStorageEnabled={true}
        />
      </View>
    );
  };

  maybeRenderWebviewError = () => {
    if (this.state.webviewErrorMessages.length > 0) {
      return (
        <View style={{ zIndex: 2000, backgroundColor: "orange", margin: 4 }}>
          {this.state.webviewErrorMessages.map((errorMessage, index) => {
            return <Text key={index}>{errorMessage}</Text>;
          })}
        </View>
      );
    }
    return null;
  };

  maybeRenderErrorBoundaryMessage = () => {
    if (this.state.hasError)
      return (
        <View style={{ zIndex: 2000, backgroundColor: "red", margin: 5 }}>
          {this.state.webviewErrorMessages}
        </View>
      );
    return null;
  };

  render() {
    return (
      <View
        style={{
          flex: 1
        }}
      >
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "#fff1ad"
          }}
        >
          {this.renderWebView()}
          {this.maybeRenderErrorBoundaryMessage()}
          {this.maybeRenderWebviewError()}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  activityOverlayStyle: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, .5)",
    display: "flex",
    justifyContent: "center",
    alignContent: "center",
    borderRadius: 5
  },
  activityIndicatorContainer: {
    backgroundColor: "lightgray",
    padding: 10,
    borderRadius: 50,
    alignSelf: "center",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowRadius: 5,
    shadowOpacity: 1.0
  },
  button: Platform.select({
    ios: {},
    android: {
      elevation: 4,
      // Material design blue from https://material.google.com/style/color.html#color-color-palette
      backgroundColor: "#2196F3",
      borderRadius: 2
    }
  }),
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: "#777"
  },
  textBold: {
    fontWeight: "500",
    color: "#000"
  },
  buttonText: {
    fontSize: 21,
    color: "rgb(0,122,255)"
  },
  buttonTouchable: {
    padding: 16
  }
});
