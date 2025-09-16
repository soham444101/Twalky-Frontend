import { Dimensions } from "react-native"

// const Colors = {
//   background: "#F4F6FA",  // very light gray-blue → clean, modern
//   surface: "#FFFFFF",     // cards / video tiles
//   text: "#1C1C1E",        // almost black → sharp text
//   subtext: "#5A5F6A",     // muted gray-blue for secondary text
//   primary: "#4A90E2",     // elegant blue (trustworthy, professional)
//   secondary: "#50E3C2",   // mint green accent → fresh + premium
//   danger: "#E74C3C",      // softer red for leave/warning
//   border: "#E0E6ED",      // light neutral border
//   inputBg: "#F9FAFB",     // subtle gray for input fields
//   muted: "#A0A7B1",       // muted icons / disabled
//   shadow: "#1C1C1E33",    // 20% opacity black → smooth depth
// };
const Colors = {
  background: "#1B0E0A",   // deep cocoa brown (base background)
  surface: "#2A1A14",      // slightly lighter brown (cards, panels)
  text: "#EADBC8",         // creamy beige text (soft on eyes)
  subtext: "#BFA78B",      // warm latte for secondary text
  primary: "#D2691E",      // rich cinnamon/chocolate orange accent
  secondary: "#8B5E3C",    // mocha brown for secondary actions
  danger: "#E76F51",       // warm terracotta red for alerts
  border: "#3B241C",       // subtle border, blends with brown tones
  inputBg: "#3A261D",      // dark latte background for inputs
  muted: "#7D6A55",        // muted coffee tone for disabled elements
  shadow: "#00000066",     // soft black shadow
};




const screenWidth = Dimensions.get("screen").width;
const screenHeight = Dimensions.get("screen").height;
export {screenHeight,screenWidth,Colors}