// // // import React from "react";
// // // import { NavigationContainer } from "@react-navigation/native";
// // // import { createStackNavigator } from "@react-navigation/stack";
// // // import LoginScreen from "./screens/LoginScreen";
// // // import SignUpScreen from "./screens/SignUpScreen";
// // // import Dashboard from "./screens/Dashboard";


// // // const Stack = createStackNavigator();

// // // const App = () => {
// // //   return (
// // //     <NavigationContainer>
// // //       <Stack.Navigator>
// // //         <Stack.Screen 
// // //           name="Login" 
// // //           component={LoginScreen} 
// // //           options={{ headerShown: false }}
// // //         />
// // //         <Stack.Screen 
// // //           name="SignUp" 
// // //           component={SignUpScreen} 
// // //           options={{ headerShown: false }}
// // //         />
// // //         <Stack.Screen 
// // //           name="Dashboard" 
// // //           component={Dashboard} 
// // //           options={{ headerShown: false, gestureEnabled: false }}
// // //         />
// // //       </Stack.Navigator>
// // //     </NavigationContainer>
// // //   );
// // // };

// // // export default App;




// // import { NavigationContainer } from "@react-navigation/native"
// // import { createStackNavigator } from "@react-navigation/stack"
// // import LoginScreen from "./screens/LoginScreen"
// // import SignUpScreen from "./screens/SignUpScreen"
// // import Dashboard from "./screens/Dashboard"
// // import Inventory from "./screens/Inventory"
// // import AddProduct from "./screens/AddProduct"
// // import Sales from "./screens/Sales"
// // import NewSale from "./screens/NewSale"
// // import Customers from "./screens/Customers"
// // import SaleDetails from "./screens/SaleDetails"
// // import EditProduct from "./screens/EditProduct"
// // import Prescriptions from "./screens/Prescriptions"
// // import Reports from "./screens/Reports"

// // const Stack = createStackNavigator()

// // const App = () => {
// //   return (
// //     <NavigationContainer>
// //       <Stack.Navigator>
// //         <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
// //         <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
// //         <Stack.Screen name="Dashboard" component={Dashboard} options={{ headerShown: false, gestureEnabled: false }} />
// //         <Stack.Screen name="Inventory" component={Inventory} options={{ headerShown: false }} />
// //         <Stack.Screen name="AddProduct" component={AddProduct} options={{ headerShown: false }} />
// //         <Stack.Screen name="EditProduct" component={EditProduct} options={{ headerShown: false }} />
// //         <Stack.Screen name="Sales" component={Sales} options={{ headerShown: false }} />
// //         <Stack.Screen name="NewSale" component={NewSale} options={{ headerShown: false }} />
// //         <Stack.Screen name="SaleDetails" component={SaleDetails} options={{ headerShown: false }} />
// //         <Stack.Screen name="Customers" component={Customers} options={{ headerShown: false }} />
// //         <Stack.Screen name="Prescriptions" component={Prescriptions} options={{ headerShown: false }} />
// //         <Stack.Screen name="Reports" component={Reports} options={{ headerShown: false }} />
// //       </Stack.Navigator>
// //     </NavigationContainer>
// //   )
// // }

// // export default App

// import { NavigationContainer } from "@react-navigation/native"
// import { createStackNavigator } from "@react-navigation/stack"
// import LoginScreen from "./screens/LoginScreen"
// import SignUpScreen from "./screens/SignUpScreen"
// import Dashboard from "./screens/Dashboard"
// import Inventory from "./screens/Inventory"
// import AddProduct from "./screens/AddProduct"
// import Sales from "./screens/Sales"
// import NewSale from "./screens/NewSale"
// import Customers from "./screens/Customers"
// import SaleDetails from "./screens/SaleDetails"
// import EditProduct from "./screens/EditProduct"
// import Prescriptions from "./screens/Prescriptions"
// import Reports from "./screens/Reports"

// const Stack = createStackNavigator()

// const App = () => {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator>
//         <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
//         <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
//         <Stack.Screen name="Dashboard" component={Dashboard} options={{ headerShown: false, gestureEnabled: false }} />
//         <Stack.Screen name="Inventory" component={Inventory} options={{ headerShown: false }} />
//         <Stack.Screen name="AddProduct" component={AddProduct} options={{ headerShown: false }} />
//         <Stack.Screen name="EditProduct" component={EditProduct} options={{ headerShown: false }} />
//         <Stack.Screen name="Sales" component={Sales} options={{ headerShown: false }} />
//         <Stack.Screen name="NewSale" component={NewSale} options={{ headerShown: false }} />
//         <Stack.Screen name="SaleDetails" component={SaleDetails} options={{ headerShown: false }} />
//         <Stack.Screen name="Customers" component={Customers} options={{ headerShown: false }} />
//         <Stack.Screen name="Prescriptions" component={Prescriptions} options={{ headerShown: false }} />
//         <Stack.Screen name="Reports" component={Reports} options={{ headerShown: false }} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   )
// }

// export default App

import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';

import LoginScreen from "./screens/LoginScreen";
import SignUpScreen from "./screens/SignUpScreen";
import Dashboard from "./screens/Dashboard";
import Inventory from "./screens/Inventory";
import AddProduct from "./screens/AddProduct";
import Sales from "./screens/Sales";
import NewSale from "./screens/NewSale";
import Customers from "./screens/Customers";
import SaleDetails from "./screens/SaleDetails";
import EditProduct from "./screens/EditProduct";
import Prescriptions from "./screens/Prescriptions";
import Reports from "./screens/Reports";

// Navigators
const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Custom drawer with Logout option
const CustomDrawerContent = (props) => {
  const { navigation } = props;

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Logout",
        onPress: () => {
          // Show logout success and redirect to login
          Alert.alert("Success", "Logout Successfully");
          navigation.replace("Login");
        }
      }
    ]);
  };

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <TouchableOpacity
        style={{
          padding: 16,
          backgroundColor: "#ff4444",
          margin: 10,
          borderRadius: 10,
        }}
        onPress={handleLogout}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>Logout</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
};

// Drawer Screens
const DashboardDrawer = () => {
  return (
    <Drawer.Navigator
      initialRouteName="DashboardMain"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="DashboardMain" component={Dashboard} options={{ headerShown: false, title: 'Dashboard' }} />
      <Drawer.Screen name="InventoryDrawer" component={Inventory} options={{ headerShown: false, title: 'Inventory' }} />
      <Drawer.Screen name="SalesDrawer" component={Sales} options={{ headerShown: false, title: 'Sales' }} />
      <Drawer.Screen name="CustomersDrawer" component={Customers} options={{ headerShown: false, title: 'Customers' }} />
      <Drawer.Screen name="PrescriptionsDrawer" component={Prescriptions} options={{ headerShown: false, title: 'Prescriptions' }} />
      <Drawer.Screen name="ReportsDrawer" component={Reports} options={{ headerShown: false, title: 'Reports' }} />
    </Drawer.Navigator>
  );
};

// Main App
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Dashboard" component={DashboardDrawer} options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="Inventory" component={Inventory} options={{ headerShown: false }} />
        <Stack.Screen name="AddProduct" component={AddProduct} options={{ headerShown: false }} />
        <Stack.Screen name="EditProduct" component={EditProduct} options={{ headerShown: false }} />
        <Stack.Screen name="Sales" component={Sales} options={{ headerShown: false }} />
        <Stack.Screen name="NewSale" component={NewSale} options={{ headerShown: false }} />
        <Stack.Screen name="SaleDetails" component={SaleDetails} options={{ headerShown: false }} />
        <Stack.Screen name="Customers" component={Customers} options={{ headerShown: false }} />
        <Stack.Screen name="Prescriptions" component={Prescriptions} options={{ headerShown: false }} />
        <Stack.Screen name="Reports" component={Reports} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;


