import { Image, StyleSheet, View, Button } from "react-native";
import { useNavigation } from "@react-navigation/core";
import { auth, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { Button1, TextInput1, RememberMeCheckBox } from "../components";
import { COLORS, SIZES } from "../constants";
import { useEffect, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import AsyncStorage from "@react-native-async-storage/async-storage";

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginCreds, setLoginCreds] = useState({});
  const navigation = useNavigation();
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId:
      "48441971s0239-7vdtskqgv5f2rdqgk2f57mtr1mcannv8.apps.googleusercontent.com",
    iosClientId:
      "484419710239-7ajkq2l6lddnv6m2tegada7e1lml768r.apps.googleusercontent.com",
    expoClientId:
      "484419710239-l6752ivpn6f8ikets34iq3ip5m1fn34b.apps.googleusercontent.com",
    webClientId:
      "484419710239-875b0rin3sh4b3pasfl22k06q7m229jm.apps.googleusercontent.com",
  });

  useEffect(() => {
    if (response?.type === "success") {
      getGoogleAccountInfo(response.authentication.accessToken);
    }
  }, [response]);

  useEffect(() => {
    getRembemberMeState((rememberState) => {
      if (String(rememberState) === "true") {
        readUserCredentials((loginCreds) =>
          handleLogin(loginCreds.email, loginCreds.password)
        );
      }
    });
  }, []);

  const getRembemberMeState = async (callback) => {
    try {
      const value = await AsyncStorage.getItem("@rememberstate");
      if (value !== null) {
        callback(JSON.parse(value));
      }
    } catch (e) {
      console.log("Can't read your data");
      alert(e);
    }
  };
  const getGoogleAccountInfo = async (token) => {
    try {
      const response = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const user = await response.json();
      setEmail(user.email);
      setPassword(user.id);
      signInWithGoogle(user.email, user.id);
    } catch (error) {
      // Add your own error handler here
    }
  };

  const signInWithGoogle = (email, password) => {
    fetchSignInMethodsForEmail(auth, email)
      .then((result) => {
        if (result.length == 0) {
          //register email = email, password = id
          createUserWithEmailAndPassword(auth, email, password).then(
            (results) => {
              auth.updateCurrentUser(results.user);
              if (auth.currentUser.emailVerified === false) {
                navigation.navigate("RegisterConfirmScreen");
              } else {
                navigation.navigate("Tabs");
              }
            }
          );
        } else {
          // login email = email, password = id
          handleLogin(email, password);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleLogin = (email, password) => {
    signInWithEmailAndPassword(auth, email, password)
      .then((results) => {
        //save email & password
        saveUserCredentials(email, password);
        auth.updateCurrentUser(results.user);
        if (auth.currentUser.emailVerified === false) {
          navigation.navigate("RegisterConfirmScreen");
        } else {
          navigation.navigate("Tabs");
        }
      })
      .catch((error) => {
        alert(
          "You have entered a wrong password or, your email is linked with another account!"
        );
      });
  };

  const saveUserCredentials = async (email, password) => {
    userCredentials = {
      email: email,
      password: password,
    };
    try {
      await AsyncStorage.setItem(
        "@usercredentials",
        JSON.stringify(userCredentials)
      );
    } catch (e) {
      alert("Failed to save the data");
    }
  };

  const unsaveUserCredentials = () => {
    //unsave data if rememberMe === false
  };

  const readUserCredentials = async (callback) => {
    try {
      const value = await AsyncStorage.getItem("@usercredentials");
      if (value !== null) {
        setLoginCreds(JSON.parse(value));
        callback(JSON.parse(value));
      }
    } catch (e) {
      console.log("Can't read your data");
      alert(e);
    }
  };

  const handleSignUp = () => {
    navigation.navigate("RegisterScreen");
  };

  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        source={require("../assets/adaptive-icon.png")}
      ></Image>
      <TextInput1
        setValue={setEmail}
        value={email}
        placeholder={"Email"}
      ></TextInput1>
      <TextInput1
        setValue={setPassword}
        value={password}
        placeholder={"Password"}
        secureTextEntry={true}
      ></TextInput1>
      <RememberMeCheckBox />
      <Button1
        title={"Login"}
        width={"80%"}
        onPress={() => handleLogin(email, password)}
      ></Button1>
      <Button1
        title={"Get Started"}
        width={"80%"}
        onPress={() => handleSignUp()}
      ></Button1>
      <Button1
        title={"Sign In With Google"}
        onPress={() => promptAsync()}
        width={"80%"}
        buttonColor={"#4285F4"}
        textColor={"white"}
        imageSource={require("../assets/g-logo.png")}
      ></Button1>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.darkGray,
  },
  logo: {
    height: 300,
    width: 300,
    margin: SIZES.largeMargin,
  },
});
