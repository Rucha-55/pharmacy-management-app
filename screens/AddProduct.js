// "use client"

// import { useState } from "react"
// import {
//   View,
//   Text,
//   StyleSheet,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   Alert,
//   ActivityIndicator,
//   SafeAreaView,
//   StatusBar,
//   KeyboardAvoidingView,
//   Platform,
// } from "react-native"
// import { Ionicons } from "@expo/vector-icons"
// import { collection, addDoc, serverTimestamp } from "firebase/firestore"
// import { db } from "../firebaseConfig"

// const AddProduct = ({ navigation }) => {
//   const [name, setName] = useState("")
//   const [manufacturer, setManufacturer] = useState("")
//   const [description, setDescription] = useState("")
//   const [category, setCategory] = useState("")
//   const [price, setPrice] = useState("")
//   const [costPrice, setCostPrice] = useState("")
//   const [quantity, setQuantity] = useState("")
//   const [expiryDate, setExpiryDate] = useState("")
//   const [barcode, setBarcode] = useState("")
//   const [loading, setLoading] = useState(false)

//   const validateForm = () => {
//     if (!name.trim()) {
//       Alert.alert("Error", "Product name is required")
//       return false
//     }
//     if (!price.trim() || isNaN(Number.parseFloat(price)) || Number.parseFloat(price) <= 0) {
//       Alert.alert("Error", "Please enter a valid price")
//       return false
//     }
//     if (!quantity.trim() || isNaN(Number.parseInt(quantity)) || Number.parseInt(quantity) < 0) {
//       Alert.alert("Error", "Please enter a valid quantity")
//       return false
//     }
//     return true
//   }

//   const handleAddProduct = async () => {
//     if (!validateForm()) return

//     setLoading(true)
//     try {
//       const productData = {
//         name,
//         manufacturer: manufacturer.trim() || "Unknown",
//         description: description.trim() || "",
//         category: category.trim() || "General",
//         price: Number.parseFloat(price),
//         costPrice: costPrice.trim() ? Number.parseFloat(costPrice) : 0,
//         quantity: Number.parseInt(quantity),
//         expiryDate: expiryDate.trim() || null,
//         barcode: barcode.trim() || null,
//         lowStockThreshold: 10,
//         createdAt: serverTimestamp(),
//         updatedAt: serverTimestamp(),
//       }

//       await addDoc(collection(db, "products"), productData)

//       Alert.alert("Success", "Product added successfully", [
//         {
//           text: "OK",
//           onPress: () => navigation.navigate("Inventory"),
//         },
//       ])
//     } catch (error) {
//       console.error("Error adding product:", error)
//       Alert.alert("Error", "Failed to add product")
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
//       <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
//         <View style={styles.header}>
//           <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//             <Ionicons name="arrow-back" size={24} color="#212529" />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Add New Product</Text>
//           <View style={styles.placeholder} />
//         </View>

//         <ScrollView style={styles.content}>
//           <View style={styles.formGroup}>
//             <Text style={styles.label}>Product Name *</Text>
//             <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter product name" />
//           </View>

//           <View style={styles.formGroup}>
//             <Text style={styles.label}>Manufacturer</Text>
//             <TextInput
//               style={styles.input}
//               value={manufacturer}
//               onChangeText={setManufacturer}
//               placeholder="Enter manufacturer name"
//             />
//           </View>

//           <View style={styles.formGroup}>
//             <Text style={styles.label}>Description</Text>
//             <TextInput
//               style={[styles.input, styles.textArea]}
//               value={description}
//               onChangeText={setDescription}
//               placeholder="Enter product description"
//               multiline
//               numberOfLines={4}
//             />
//           </View>

//           <View style={styles.formGroup}>
//             <Text style={styles.label}>Category</Text>
//             <TextInput
//               style={styles.input}
//               value={category}
//               onChangeText={setCategory}
//               placeholder="Enter product category"
//             />
//           </View>

//           <View style={styles.row}>
//             <View style={[styles.formGroup, styles.halfWidth]}>
//               <Text style={styles.label}>Selling Price *</Text>
//               <TextInput
//                 style={styles.input}
//                 value={price}
//                 onChangeText={setPrice}
//                 placeholder="0.00"
//                 keyboardType="numeric"
//               />
//             </View>

//             <View style={[styles.formGroup, styles.halfWidth]}>
//               <Text style={styles.label}>Cost Price</Text>
//               <TextInput
//                 style={styles.input}
//                 value={costPrice}
//                 onChangeText={setCostPrice}
//                 placeholder="0.00"
//                 keyboardType="numeric"
//               />
//             </View>
//           </View>

//           <View style={styles.row}>
//             <View style={[styles.formGroup, styles.halfWidth]}>
//               <Text style={styles.label}>Quantity *</Text>
//               <TextInput
//                 style={styles.input}
//                 value={quantity}
//                 onChangeText={setQuantity}
//                 placeholder="0"
//                 keyboardType="numeric"
//               />
//             </View>

//             <View style={[styles.formGroup, styles.halfWidth]}>
//               <Text style={styles.label}>Expiry Date</Text>
//               <TextInput style={styles.input} value={expiryDate} onChangeText={setExpiryDate} placeholder="MM/YYYY" />
//             </View>
//           </View>

//           <View style={styles.formGroup}>
//             <Text style={styles.label}>Barcode</Text>
//             <TextInput style={styles.input} value={barcode} onChangeText={setBarcode} placeholder="Enter barcode" />
//           </View>

//           <TouchableOpacity style={styles.addButton} onPress={handleAddProduct} disabled={loading}>
//             {loading ? (
//               <ActivityIndicator size="small" color="#ffffff" />
//             ) : (
//               <Text style={styles.addButtonText}>Add Product</Text>
//             )}
//           </TouchableOpacity>
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   )
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: "#f8f9fa",
//   },
//   container: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 16,
//     backgroundColor: "#ffffff",
//     borderBottomWidth: 1,
//     borderBottomColor: "#e9ecef",
//     elevation: 2,
//   },
//   backButton: {
//     padding: 8,
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#212529",
//   },
//   placeholder: {
//     width: 40,
//   },
//   content: {
//     flex: 1,
//     padding: 16,
//   },
//   formGroup: {
//     marginBottom: 16,
//   },
//   label: {
//     fontSize: 16,
//     color: "#212529",
//     marginBottom: 8,
//   },
//   input: {
//     backgroundColor: "#ffffff",
//     borderWidth: 1,
//     borderColor: "#ced4da",
//     borderRadius: 8,
//     padding: 12,
//     fontSize: 16,
//     color: "#212529",
//   },
//   textArea: {
//     height: 100,
//     textAlignVertical: "top",
//   },
//   row: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   halfWidth: {
//     width: "48%",
//   },
//   addButton: {
//     backgroundColor: "#0d6efd",
//     borderRadius: 8,
//     padding: 16,
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 16,
//     marginBottom: 32,
//   },
//   addButtonText: {
//     color: "#ffffff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
// })

// export default AddProduct

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';

const AddProduct = ({ navigation }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const handleAddProduct = async () => {
    // Validate inputs
    if (!name.trim()) {
      Alert.alert('Error', 'Product name is required');
      return;
    }
    
    if (!price.trim() || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }
    
    if (!quantity.trim() || isNaN(parseInt(quantity)) || parseInt(quantity) < 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create product object
      const productData = {
        name: name.trim(),
        category: category.trim() || 'Uncategorized',
        description: description.trim(),
        price: parseFloat(price),
        quantity: parseInt(quantity),
        expiryDate: Timestamp.fromDate(expiryDate),
        createdAt: Timestamp.now()
      };
      
      // Add to Firestore
      await addDoc(collection(db, 'products'), productData);
      
      Alert.alert(
        'Success',
        'Product added successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error adding product:', error);
      Alert.alert('Error', 'Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setExpiryDate(selectedDate);
    }
  };
  
  const formatDate = (date) => {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Product</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Product Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter product name"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            value={category}
            onChangeText={setCategory}
            placeholder="Enter category"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter product description"
            multiline
            numberOfLines={4}
          />
        </View>
        
        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Price *</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="0.00"
              keyboardType="decimal-pad"
            />
          </View>
          
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>Quantity *</Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              placeholder="0"
              keyboardType="number-pad"
            />
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Expiry Date</Text>
          <TouchableOpacity 
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text>{formatDate(expiryDate)}</Text>
            <Icon name="calendar-today" size={20} color="#757575" />
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={expiryDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddProduct}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Icon name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.addButtonText}>Add Product</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  datePickerButton: {
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AddProduct;