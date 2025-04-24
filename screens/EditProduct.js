"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../firebaseConfig"

const EditProduct = ({ route, navigation }) => {
  const { productId } = route.params

  const [product, setProduct] = useState(null)
  const [name, setName] = useState("")
  const [manufacturer, setManufacturer] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [price, setPrice] = useState("")
  const [costPrice, setCostPrice] = useState("")
  const [quantity, setQuantity] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [barcode, setBarcode] = useState("")
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchProduct()
  }, [productId])

  const fetchProduct = async () => {
    try {
      const productDoc = await getDoc(doc(db, "products", productId))

      if (productDoc.exists()) {
        const productData = productDoc.data()
        setProduct(productData)
        setName(productData.name || "")
        setManufacturer(productData.manufacturer || "")
        setDescription(productData.description || "")
        setCategory(productData.category || "")
        setPrice(productData.price ? productData.price.toString() : "")
        setCostPrice(productData.costPrice ? productData.costPrice.toString() : "")
        setQuantity(productData.quantity ? productData.quantity.toString() : "")
        setExpiryDate(productData.expiryDate || "")
        setBarcode(productData.barcode || "")
      } else {
        Alert.alert("Error", "Product not found")
        navigation.goBack()
      }

      setLoading(false)
    } catch (error) {
      console.error("Error fetching product:", error)
      Alert.alert("Error", "Failed to load product details")
      setLoading(false)
      navigation.goBack()
    }
  }

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Product name is required")
      return false
    }
    if (!price.trim() || isNaN(Number.parseFloat(price)) || Number.parseFloat(price) <= 0) {
      Alert.alert("Error", "Please enter a valid price")
      return false
    }
    if (!quantity.trim() || isNaN(Number.parseInt(quantity)) || Number.parseInt(quantity) < 0) {
      Alert.alert("Error", "Please enter a valid quantity")
      return false
    }
    return true
  }

  const handleUpdateProduct = async () => {
    if (!validateForm()) return

    setUpdating(true)
    try {
      const productData = {
        name,
        manufacturer: manufacturer.trim() || "Unknown",
        description: description.trim() || "",
        category: category.trim() || "General",
        price: Number.parseFloat(price),
        costPrice: costPrice.trim() ? Number.parseFloat(costPrice) : 0,
        quantity: Number.parseInt(quantity),
        expiryDate: expiryDate.trim() || null,
        barcode: barcode.trim() || null,
        updatedAt: serverTimestamp(),
      }

      await updateDoc(doc(db, "products", productId), productData)

      Alert.alert("Success", "Product updated successfully", [
        {
          text: "OK",
          onPress: () => navigation.navigate("Inventory"),
        },
      ])
    } catch (error) {
      console.error("Error updating product:", error)
      Alert.alert("Error", "Failed to update product")
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0d6efd" />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#212529" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Product</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Product Name *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter product name" />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Manufacturer</Text>
            <TextInput
              style={styles.input}
              value={manufacturer}
              onChangeText={setManufacturer}
              placeholder="Enter manufacturer name"
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

          <View style={styles.formGroup}>
            <Text style={styles.label}>Category</Text>
            <TextInput
              style={styles.input}
              value={category}
              onChangeText={setCategory}
              placeholder="Enter product category"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Selling Price *</Text>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Cost Price</Text>
              <TextInput
                style={styles.input}
                value={costPrice}
                onChangeText={setCostPrice}
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Quantity *</Text>
              <TextInput
                style={styles.input}
                value={quantity}
                onChangeText={setQuantity}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Expiry Date</Text>
              <TextInput style={styles.input} value={expiryDate} onChangeText={setExpiryDate} placeholder="MM/YYYY" />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Barcode</Text>
            <TextInput style={styles.input} value={barcode} onChangeText={setBarcode} placeholder="Enter barcode" />
          </View>

          <TouchableOpacity style={styles.updateButton} onPress={handleUpdateProduct} disabled={updating}>
            {updating ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.updateButtonText}>Update Product</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6c757d",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#212529",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: "#212529",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#212529",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfWidth: {
    width: "48%",
  },
  updateButton: {
    backgroundColor: "#0d6efd",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 32,
  },
  updateButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default EditProduct

