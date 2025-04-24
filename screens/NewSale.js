// "use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { collection, getDocs, doc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../firebaseConfig"

const NewSale = ({ navigation }) => {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [cart, setCart] = useState([])
  const [customers, setCustomers] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showCustomerList, setShowCustomerList] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [discount, setDiscount] = useState("0")

  useEffect(() => {
    fetchProducts()
    fetchCustomers()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (product.barcode && product.barcode.includes(searchQuery)),
      )
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts(products)
    }
  }, [searchQuery, products])

  const fetchProducts = async () => {
    try {
      const productsSnapshot = await getDocs(collection(db, "products"))
      const productsList = productsSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((product) => (product.quantity || 0) > 0)
      setProducts(productsList)
      setFilteredProducts(productsList)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching products:", error)
      Alert.alert("Error", "Failed to load products")
      setLoading(false)
    }
  }

  const fetchCustomers = async () => {
    try {
      const customersSnapshot = await getDocs(collection(db, "customers"))
      const customersList = customersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setCustomers(customersList)
    } catch (error) {
      console.error("Error fetching customers:", error)
    }
  }

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id)

    if (existingItem) {
      if (existingItem.quantity >= product.quantity) {
        Alert.alert("Stock Limit", "Cannot add more than available stock")
        return
      }

      const updatedCart = cart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      setCart(updatedCart)
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
  }

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter((item) => item.id !== productId)
    setCart(updatedCart)
  }

  const updateQuantity = (productId, newQuantity) => {
    const product = products.find((p) => p.id === productId)
    const numQuantity = Number.parseInt(newQuantity) || 0

    if (numQuantity > product.quantity) {
      Alert.alert("Stock Limit", "Cannot add more than available stock")
      return
    }

    if (numQuantity <= 0) {
      removeFromCart(productId)
      return
    }

    const updatedCart = cart.map((item) => (item.id === productId ? { ...item, quantity: numQuantity } : item))
    setCart(updatedCart)
  }

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const discountAmount = (Number.parseFloat(discount) / 100) * subtotal
    return subtotal - discountAmount
  }

  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      Alert.alert("Empty Cart", "Please add products to complete the sale")
      return
    }

    setSubmitting(true)

    try {
      // Create sale record
      const saleData = {
        items: cart.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity,
        })),
        customerId: selectedCustomer?.id || null,
        customerName: selectedCustomer?.name || "Walk-in Customer",
        subtotal: calculateSubtotal(),
        discountPercentage: Number.parseFloat(discount) || 0,
        totalAmount: calculateTotal(),
        paymentMethod: paymentMethod,
        date: serverTimestamp(),
        createdAt: serverTimestamp(),
      }

      const saleRef = await addDoc(collection(db, "sales"), saleData)

      // Update product quantities
      for (const item of cart) {
        const productRef = doc(db, "products", item.id)
        await updateDoc(productRef, {
          quantity: item.stockQuantity - item.quantity,
        })
      }

      Alert.alert("Sale Complete", "Sale has been recorded successfully", [
        {
          text: "OK",
          onPress: () => navigation.navigate("Sales"),
        },
      ])
    } catch (error) {
      console.error("Error completing sale:", error)
      Alert.alert("Error", "Failed to complete the sale")
    } finally {
      setSubmitting(false)
    }
  }

  const renderProductItem = ({ item }) => (
    <TouchableOpacity style={styles.productItem} onPress={() => addToCart(item)}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productDetails}>
          {item.manufacturer} • Stock: {item.quantity}
        </Text>
      </View>
      <View style={styles.productPriceContainer}>
        <Text style={styles.productPrice}>₹{item.price.toFixed(2)}</Text>
        <Ionicons name="add-circle" size={24} color="#0d6efd" />
      </View>
    </TouchableOpacity>
  )

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemName}>{item.name}</Text>
        <Text style={styles.cartItemPrice}>₹{item.price.toFixed(2)}</Text>
      </View>
      <View style={styles.cartItemActions}>
        <TextInput
          style={styles.quantityInput}
          value={item.quantity.toString()}
          onChangeText={(text) => updateQuantity(item.id, text)}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.removeButton} onPress={() => removeFromCart(item.id)}>
          <Ionicons name="trash-outline" size={20} color="#dc3545" />
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderCustomerItem = ({ item }) => (
    <TouchableOpacity
      style={styles.customerItem}
      onPress={() => {
        setSelectedCustomer(item)
        setShowCustomerList(false)
      }}
    >
      <Text style={styles.customerName}>{item.name}</Text>
      <Text style={styles.customerPhone}>{item.phone}</Text>
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0d6efd" />
        <Text style={styles.loadingText}>Loading products...</Text>
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
          <Text style={styles.headerTitle}>New Sale</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#6c757d" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products by name or barcode"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.customerContainer}>
            <Text style={styles.sectionTitle}>Customer</Text>
            <TouchableOpacity style={styles.customerSelector} onPress={() => setShowCustomerList(!showCustomerList)}>
              <Text style={styles.customerSelectorText}>
                {selectedCustomer ? selectedCustomer.name : "Walk-in Customer"}
              </Text>
              <Ionicons name={showCustomerList ? "chevron-up" : "chevron-down"} size={20} color="#6c757d" />
            </TouchableOpacity>

            {showCustomerList && (
              <View style={styles.customerListContainer}>
                <FlatList
                  data={customers}
                  renderItem={renderCustomerItem}
                  keyExtractor={(item) => item.id}
                  ListHeaderComponent={
                    <TouchableOpacity
                      style={styles.customerItem}
                      onPress={() => {
                        setSelectedCustomer(null)
                        setShowCustomerList(false)
                      }}
                    >
                      <Text style={styles.customerName}>Walk-in Customer</Text>
                      <Text style={styles.customerPhone}>No phone number</Text>
                    </TouchableOpacity>
                  }
                  ListEmptyComponent={<Text style={styles.emptyText}>No customers found</Text>}
                />
              </View>
            )}
          </View>

          <View style={styles.productsContainer}>
            <Text style={styles.sectionTitle}>Products</Text>
            <FlatList
              data={filteredProducts}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.id}
              style={styles.productsList}
              nestedScrollEnabled={true}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  {searchQuery ? "No products match your search" : "No products available"}
                </Text>
              }
            />
          </View>

          <View style={styles.cartContainer}>
            <Text style={styles.sectionTitle}>Cart ({cart.length} items)</Text>
            {cart.length > 0 ? (
              <>
                <FlatList
                  data={cart}
                  renderItem={renderCartItem}
                  keyExtractor={(item) => item.id}
                  style={styles.cartList}
                  nestedScrollEnabled={true}
                />

                <View style={styles.paymentSection}>
                  <Text style={styles.paymentSectionTitle}>Payment Details</Text>

                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Payment Method</Text>
                    <View style={styles.paymentMethodContainer}>
                      <TouchableOpacity
                        style={[styles.paymentMethodButton, paymentMethod === "cash" && styles.paymentMethodSelected]}
                        onPress={() => setPaymentMethod("cash")}
                      >
                        <Text
                          style={[
                            styles.paymentMethodText,
                            paymentMethod === "cash" && styles.paymentMethodTextSelected,
                          ]}
                        >
                          Cash
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.paymentMethodButton, paymentMethod === "card" && styles.paymentMethodSelected]}
                        onPress={() => setPaymentMethod("card")}
                      >
                        <Text
                          style={[
                            styles.paymentMethodText,
                            paymentMethod === "card" && styles.paymentMethodTextSelected,
                          ]}
                        >
                          Card
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.paymentMethodButton, paymentMethod === "upi" && styles.paymentMethodSelected]}
                        onPress={() => setPaymentMethod("upi")}
                      >
                        <Text
                          style={[
                            styles.paymentMethodText,
                            paymentMethod === "upi" && styles.paymentMethodTextSelected,
                          ]}
                        >
                          UPI
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Discount (%)</Text>
                    <TextInput
                      style={styles.discountInput}
                      value={discount}
                      onChangeText={setDiscount}
                      keyboardType="numeric"
                      maxLength={3}
                    />
                  </View>

                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Subtotal</Text>
                    <Text style={styles.paymentValue}>₹{calculateSubtotal().toFixed(2)}</Text>
                  </View>

                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Discount</Text>
                    <Text style={styles.paymentValue}>
                      ₹{((Number.parseFloat(discount) / 100) * calculateSubtotal()).toFixed(2)}
                    </Text>
                  </View>

                  <View style={[styles.paymentRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>₹{calculateTotal().toFixed(2)}</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.completeButton} onPress={handleCompleteSale} disabled={submitting}>
                  {submitting ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.completeButtonText}>Complete Sale</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.emptyCartText}>Your cart is empty. Add products to proceed.</Text>
            )}
          </View>
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
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32, // Add extra padding at the bottom
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: "#212529",
  },
  customerContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 8,
  },
  customerSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 12,
    elevation: 1,
  },
  customerSelectorText: {
    fontSize: 16,
    color: "#212529",
  },
  customerListContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    marginTop: 8,
    maxHeight: 200,
    elevation: 2,
  },
  customerItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  customerName: {
    fontSize: 16,
    color: "#212529",
  },
  customerPhone: {
    fontSize: 14,
    color: "#6c757d",
    marginTop: 4,
  },
  productsContainer: {
    marginBottom: 16,
    maxHeight: 300, // Limit height to ensure other sections are visible
  },
  productsList: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    elevation: 1,
    maxHeight: 250, // Ensure it doesn't take too much space
  },
  productItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    color: "#212529",
  },
  productDetails: {
    fontSize: 14,
    color: "#6c757d",
    marginTop: 4,
  },
  productPriceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
    marginRight: 8,
  },
  cartContainer: {
    marginBottom: 16,
  },
  cartList: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    elevation: 1,
    marginBottom: 16,
    maxHeight: 200, // Limit height to ensure payment section is visible
  },
  cartItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    color: "#212529",
  },
  cartItemPrice: {
    fontSize: 14,
    color: "#6c757d",
    marginTop: 4,
  },
  cartItemActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityInput: {
    width: 50,
    height: 40,
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 4,
    textAlign: "center",
    marginRight: 8,
  },
  removeButton: {
    padding: 8,
  },
  paymentSection: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
  },
  paymentSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 16,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 16,
    color: "#212529",
  },
  paymentValue: {
    fontSize: 16,
    color: "#212529",
  },
  paymentMethodContainer: {
    flexDirection: "row",
  },
  paymentMethodButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#ced4da",
    marginLeft: 8,
    borderRadius: 4,
  },
  paymentMethodSelected: {
    backgroundColor: "#0d6efd",
    borderColor: "#0d6efd",
  },
  paymentMethodText: {
    color: "#212529",
  },
  paymentMethodTextSelected: {
    color: "#ffffff",
  },
  discountInput: {
    width: 80,
    height: 40,
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 4,
    textAlign: "center",
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212529",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0d6efd",
  },
  completeButton: {
    backgroundColor: "#0d6efd",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  completeButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    color: "#6c757d",
    padding: 16,
  },
  emptyCartText: {
    textAlign: "center",
    color: "#6c757d",
    padding: 32,
    backgroundColor: "#ffffff",
    borderRadius: 8,
  },
})

export default NewSale