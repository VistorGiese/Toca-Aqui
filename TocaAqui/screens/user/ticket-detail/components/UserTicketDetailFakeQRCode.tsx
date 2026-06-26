import React from "react";
import { View, StyleSheet } from "react-native";

const PATTERN = [
  [1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1],
];

function FinderPattern({ style }: { style: object }) {
  return (
    <View style={style}>
      {PATTERN.map((row, ri) => (
        <View key={ri} style={{ flexDirection: "row" }}>
          {row.map((cell, ci) => (
            <View
              key={ci}
              style={[qrStyles.module, cell ? qrStyles.moduleDark : qrStyles.moduleLight]}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

export default function UserTicketDetailFakeQRCode() {
  return (
    <View style={qrStyles.container}>
      <FinderPattern style={qrStyles.finderTL} />
      <FinderPattern style={qrStyles.finderTR} />
      <FinderPattern style={qrStyles.finderBL} />

      {[...Array(10)].map((_, i) => (
        <View
          key={i}
          style={[
            qrStyles.dataModule,
            {
              top: 10 + ((i * 17) % 120),
              left: 20 + ((i * 23) % 120),
              width: 6 + (i % 3) * 4,
              height: 6 + ((i + 1) % 3) * 4,
            },
          ]}
        />
      ))}
    </View>
  );
}

const qrStyles = StyleSheet.create({
  container: {
    width: 180,
    height: 180,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    position: "relative",
    padding: 12,
    overflow: "hidden",
  },
  finderTL: { position: "absolute", top: 12, left: 12 },
  finderTR: { position: "absolute", top: 12, right: 12 },
  finderBL: { position: "absolute", bottom: 12, left: 12 },
  module: { width: 7, height: 7 },
  moduleDark: { backgroundColor: "#111111" },
  moduleLight: { backgroundColor: "#FFFFFF" },
  dataModule: {
    position: "absolute",
    backgroundColor: "#222222",
    borderRadius: 1,
  },
});
