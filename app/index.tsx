// filepath: /c:/School/Spring 2025/Capstone/MealPlanApp/app/index.tsx
import { Text, View } from "react-native";
import MealPlanCalendar from '@/components/MealPlanCalendar';

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>My calendar</Text>
      <MealPlanCalendar />
    </View>
  );
}
