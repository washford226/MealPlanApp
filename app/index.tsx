
import MealPlanCalendar from '@/components/MealPlanCalendar';
import LoginScreen from '@/components/LoginScreen';

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (

