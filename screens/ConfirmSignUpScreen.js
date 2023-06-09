import {
  Image,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from "react-native";
import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { useNavigation } from "@react-navigation/core";

import { Button1, TextInput1 } from "../components";
import { COLORS, SIZES, FONTS } from "../constants";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
} from "firebase/auth";

const ConfirmSignUpScreen = () => {
  const user = auth.currentUser;
  const navigation = useNavigation();

  useEffect(() => {
    user.reload().finally(() => {
      if (user && user.emailVerified) {
        navigation.navigate("Tabs");
      } else {
        sendEmailVerification(auth.currentUser).catch(() =>
          alert("Slow down and check your spam folder.")
        );
      }
    });
  }, []);

  const checkEmailVerification = () => {
    user.reload().finally(() => {
      if (user && user.emailVerified) {
        navigation.navigate("Tabs");
      } else {
        alert("Check your email.");
        sendEmailVerification(auth.currentUser).catch(() =>
          alert("Slow down and check your spam folder.")
        );
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirm Your Account</Text>
      <Text style={styles.text}>
        Please verify your account through your email!
      </Text>
      <Button1 title={"Click"} onPress={() => checkEmailVerification()} />
      {/* <Button1
        title="Confirmed? Click Here"
        onPress={sendVerification}
      ></Button1> */}
    </View>
  );
};

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
  title: {
    fontSize: SIZES.h1,
    fontFamily: FONTS.Roboto_Mono_Bold,
    color: COLORS.white,
  },
  text: {
    fontFamily: FONTS.Roboto_Mono_Bold,
    color: COLORS.white,
    width: "80%",
  },
  text_small: {
    fontFamily: FONTS.Roboto_Mono_Bold,
    color: COLORS.white,
    width: "80%",
  },
  text_link: {
    color: COLORS.hyperlink,
  },
});

export default ConfirmSignUpScreen;
