"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../firebaseConfig"

const SaleDetails = ({ route, navigation }) => {
  const { saleId } = route.params

  const [sale, setSale] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSaleDetails()
  }, [saleId])

  const fetchSaleDetails = async () => {
    try {
      const saleDoc = await getDoc(doc(db, "sales", saleId))

      if (saleDoc.exists()) {
        setSale({ id: saleDoc.id, ...saleDoc.data() })
      } else {
        Alert.alert("Error", "Sale not found")
        navigation.goBack()
      }

      setLoading(false)
    } catch (error) {
      console.error("Error fetching sale details:", error)
      Alert.alert("Error", "Failed to load sale details")
      setLoading(false)
      navigation.goBack()
    }
  }

  const formatCurrency = (amount) => {
    return `₹${Number.parseFloat(amount).toFixed(2)}`
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A"
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const renderSaleItem = ({ item }) => (
    <View style={styles.saleItem}>
      <View style={styles.saleItemInfo}>
        <Text style={styles.saleItemName}>{item.name}</Text>
        <Text style={styles.saleItemPrice}>
          {formatCurrency(item.price)} × {item.quantity}
        </Text>
      </View>
      <Text style={styles.saleItemTotal}>{formatCurrency(item.subtotal)}</Text>
    </View>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0d6efd" />
        <Text style={styles.loadingText}>Loading sale details...</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#212529" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sale Details</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.saleHeader}>
            <View style={styles.saleInfo}>
              <Text style={styles.saleId}>Invoice #{sale.id.substring(0, 8)}</Text>
              <Text style={styles.saleDate}>{formatDate(sale.date)}</Text>
            </View>
            <View style={styles.customerInfo}>
              <Text style={styles.customerTitle}>Customer</Text>
              <Text style={styles.customerName}>{sale.customerName || "Walk-in Customer"}</Text>
            </View>
          </View>

          <View style={styles.itemsContainer}>
            <Text style={styles.sectionTitle}>Items</Text>
            <FlatList
              data={sale.items}
              renderItem={renderSaleItem}
              keyExtractor={(item, index) => `${item.productId}-${index}`}
              style={styles.itemsList}
              ListEmptyComponent={<Text style={styles.emptyText}>No items in this sale</Text>}
            />
          </View>

          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatCurrency(sale.subtotal || 0)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount ({sale.discountPercentage || 0}%)</Text>
              <Text style={styles.summaryValue}>
                -{formatCurrency(((sale.subtotal || 0) * (sale.discountPercentage || 0)) / 100)}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(sale.totalAmount || 0)}</Text>
            </View>
          </View>

          <View style={styles.paymentContainer}>
            <Text style={styles.sectionTitle}>Payment Information</Text>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Payment Method</Text>
              <Text style={styles.paymentValue}>
                {sale.paymentMethod ? sale.paymentMethod.charAt(0).toUpperCase() + sale.paymentMethod.slice(1) : "Cash"}
              </Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Payment Status</Text>
              <View style={[styles.statusBadge, { backgroundColor: "#198754" }]}>
                <Text style={styles.statusText}>Paid</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
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
  saleHeader: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
  },
  saleInfo: {
    marginBottom: 16,
  },
  saleId: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 4,
  },
  saleDate: {
    fontSize: 14,
    color: "#6c757d",
  },
  customerInfo: {
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    paddingTop: 16,
  },
  customerTitle: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 4,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#212529",
  },
  itemsContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 16,
  },
  itemsList: {
    maxHeight: 200,
  },
  saleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  saleItemInfo: {
    flex: 1,
  },
  saleItemName: {
    fontSize: 16,
    color: "#212529",
  },
  saleItemPrice: {
    fontSize: 14,
    color: "#6c757d",
    marginTop: 4,
  },
  saleItemTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
  },
  summaryContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#212529",
  },
  summaryValue: {
    fontSize: 16,
    color: "#212529",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    marginTop: 8,
    paddingTop: 16,
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
  paymentContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    elevation: 1,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  paymentLabel: {
    fontSize: 16,
    color: "#212529",
  },
  paymentValue: {
    fontSize: 16,
    color: "#212529",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  emptyText: {
    textAlign: "center",
    color: "#6c757d",
    padding: 16,
  },
})

export default SaleDetails

