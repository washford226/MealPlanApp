import { Text, View } from "react-native";
import MealPlanCalendar from '@/components/MealPlanCalendar';

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "flex-start", // Align content to the top
        alignItems: "center",
        paddingTop: 50, // Add padding to lower the content
      }}
    >
      <Text>My calendar</Text>
      <MealPlanCalendar />
    </View>
  );
}