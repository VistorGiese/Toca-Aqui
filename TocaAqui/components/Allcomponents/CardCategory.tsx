import React from "react";
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Dimensions,
} from "react-native";

const BAR_COLORS = {
  sertanejo: "#4F4F82",
  mpb: "#92E898",
  rock: "#FF99A4",
  funk: "#82A3E1",
};

const MOCK_CATEGORIES = [
  { name: "Sertanejo", barColor: BAR_COLORS.sertanejo },
  { name: "MPB", barColor: BAR_COLORS.mpb },
  { name: "Rock", barColor: BAR_COLORS.rock },
  { name: "Funk", barColor: BAR_COLORS.funk },
];

interface CardCategoryProps {
  categoryName: string;
  barColor: string;
  onPress?: () => void;
}

const CardCategory: React.FC<CardCategoryProps> = ({
  categoryName,
  barColor,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.cardContainer} onPress={onPress}>
      <Text style={styles.categoryText}>{categoryName}</Text>
      <View style={[styles.colorBar, { backgroundColor: barColor }]} />
    </TouchableOpacity>
  );
};

export default function CategorySection() {
  return (
    <View style={styles.categoriesContainer}>
      {MOCK_CATEGORIES.map((cat, index) => (
        <CardCategory
          key={index}
          categoryName={cat.name}
          barColor={cat.barColor}
          onPress={() => console.log("Categoria selecionada:", cat.name)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cardContainer: {
    backgroundColor: "#160427",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 30,
    width: "48%",
    marginBottom: 15,
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    position: "relative",
    overflow: "hidden",
  },
  categoryText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Montserrat-Bold",
    textTransform: "uppercase",
  },
  colorBar: {
    width: 5,
    height: "300%",
    position: "absolute",
    right: 0,
    top: 0,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
});