import { Dimensions } from "react-native"


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
const demoImage ="https://images.pexels.com/photos/23833694/pexels-photo-23833694.jpeg"
export {screenHeight,screenWidth,Colors,demoImage}