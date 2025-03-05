import React, { useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Linking } from "react-native";
import QRCode from "react-native-qrcode-svg";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

export default function App() {
  const [inputType, setInputType] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [smsMessage, setSmsMessage] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [wifiName, setWifiName] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [qrGenerated, setQrGenerated] = useState(false);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const qrRef = useRef(null);

  const generateQR = () => {
    setQrGenerated(true);
  };

  const getQRData = () => {
    switch (inputType) {
      case "wifi":
        return `WIFI:S:${wifiName};T:WPA;P:${wifiPassword};;`;
      case "email":
        return `mailto:${inputValue}?body=${emailMessage}`;
      case "sms":
        return `sms:${inputValue}?body=${smsMessage}`;
      case "website":
        return inputValue.startsWith("http") ? inputValue : `https://${inputValue}`;
      case "phone":
        return `tel:${inputValue}`;
      case "snapchat":
        return `https://www.snapchat.com/add/${inputValue}`;  // Snapchat ID
      case "facebook":
        return `https://www.facebook.com/${inputValue}`;  // Facebook ID
      case "instagram":
        return `https://www.instagram.com/${inputValue}`;  // Instagram ID
      default:
        return inputValue;
    }
  };

  const saveQRCode = async () => {
    if (!permissionResponse?.granted) {
      const permission = await requestPermission();
      if (!permission.granted) {
        Alert.alert("Permission Denied", "You need to allow storage access to save the QR code.");
        return;
      }
    }

    if (qrRef.current) {
      qrRef.current.toDataURL(async (data) => {
        const filename = FileSystem.documentDirectory + "qrcode.png";
        await FileSystem.writeAsStringAsync(filename, data, { encoding: FileSystem.EncodingType.Base64 });
        const asset = await MediaLibrary.createAssetAsync(filename);
        await MediaLibrary.createAlbumAsync("Download", asset, false);
        Alert.alert("Success", "QR Code saved to gallery!");
      });
    }
  };

  const sendSMS = () => {
    if (!inputValue || !smsMessage) {
      Alert.alert("Error", "Please provide a phone number and a message.");
      return;
    }

    const smsUrl = `sms:${inputValue}?body=${smsMessage}`;
    Linking.openURL(smsUrl).catch((err) => {
      Alert.alert("Error", "Unable to send SMS.");
    });
  };

  const sendEmail = () => {
    if (!inputValue || !emailMessage) {
      Alert.alert("Error", "Please provide an email address and a message.");
      return;
    }

    const emailUrl = `mailto:${inputValue}?body=${emailMessage}`;
    Linking.openURL(emailUrl).catch((err) => {
      Alert.alert("Error", "Unable to send email.");
    });
  };

  return (
    <View style={styles.container}>
      {inputType === null ? (
        <>
          <Text style={styles.title}>Select QR Code Type</Text>
          <TouchableOpacity style={styles.button} onPress={() => setInputType("wifi")}><Text style={styles.buttonText}>WiFi</Text></TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setInputType("text")}><Text style={styles.buttonText}>Text</Text></TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setInputType("phone")}><Text style={styles.buttonText}>Phone Number</Text></TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setInputType("youtube")}><Text style={styles.buttonText}>YouTube Video</Text></TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setInputType("email")}><Text style={styles.buttonText}>Email</Text></TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setInputType("sms")}><Text style={styles.buttonText}>SMS</Text></TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setInputType("website")}><Text style={styles.buttonText}>Website</Text></TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setInputType("snapchat")}><Text style={styles.buttonText}>Snapchat</Text></TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setInputType("facebook")}><Text style={styles.buttonText}>Facebook</Text></TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setInputType("instagram")}><Text style={styles.buttonText}>Instagram</Text></TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity style={styles.backButton} onPress={() => setInputType(null)}><Text style={styles.backButtonText}>Back</Text></TouchableOpacity>
          <Text style={styles.title}>QR Code Generator</Text>
          {inputType === "wifi" ? (
            <>
              <TextInput style={styles.input} placeholder="Enter WiFi Name" value={wifiName} onChangeText={setWifiName} />
              <TextInput style={styles.input} placeholder="Enter WiFi Password"  value={wifiPassword} onChangeText={setWifiPassword} />
            </>
          ) : inputType === "sms" ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Enter Phone Number"
                value={inputValue}
                onChangeText={setInputValue}
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input}
                placeholder="Enter Message"
                value={smsMessage}
                onChangeText={setSmsMessage}
              />
            </>
          ) : inputType === "email" ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Enter Email Address"
                value={inputValue}
                onChangeText={setInputValue}
                keyboardType="email-address"
              />
              <TextInput
                style={styles.input}
                placeholder="Enter Message"
                value={emailMessage}
                onChangeText={setEmailMessage}
              />
            </>
          ) : inputType === "snapchat" || inputType === "facebook" || inputType === "instagram" ? (
            <TextInput
              style={styles.input}
              placeholder={`Enter ${inputType} ID`}
              value={inputValue}
              onChangeText={setInputValue}
            />
          ) : inputType === "phone" ? (
            <TextInput
              style={styles.input}
              placeholder="Enter Phone Number"
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="phone-pad"
            />
          ) : (
            <TextInput style={styles.input} placeholder={`Enter ${inputType}`} value={inputValue} onChangeText={setInputValue} />
          )}
          <TouchableOpacity style={styles.button} onPress={generateQR} disabled={!inputValue}>
            <Text style={styles.buttonText}>Generate QR Code</Text>
          </TouchableOpacity>
          {qrGenerated && <QRCode value={getQRData()} size={200} getRef={qrRef} style={{ marginVertical: 20 }} />}
          {qrGenerated && <TouchableOpacity style={styles.button} onPress={saveQRCode}><Text style={styles.buttonText}>Save QR Code</Text></TouchableOpacity>}
          {inputType === "sms" && (
            <TouchableOpacity style={styles.button} onPress={sendSMS}>
              <Text style={styles.buttonText}>Send SMS</Text>
            </TouchableOpacity>
          )}
          {inputType === "email" && (
            <TouchableOpacity style={styles.button} onPress={sendEmail}>
              <Text style={styles.buttonText}>Send Email</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#6ca87f",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    padding: 10,
    width: "100%",
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderColor: "#ccc",
  },
  button: {
    backgroundColor: "#a85671",
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    backgroundColor: "#ff4d4d",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
    width: "80%",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
