"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "../firebaseConfig"

const Sales = ({ navigation }) => {
  const [sales, setSales] = useState([])
  const [filteredSales, setFilteredSales] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchSales()
    })

    return unsubscribe
  }, [navigation])

  useEffect(() => {
    if (searchQuery) {
      const filtered = sales.filter(
        (sale) =>
          (sale.customerName && sale.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (sale.id && sale.id.toLowerCase().includes(searchQuery.toLowerCase())),
      )
      setFilteredSales(filtered)
    } else {
      setFilteredSales(sales)
    }
  }, [searchQuery, sales])

  const fetchSales = async () => {
    try {
      const salesQuery = query(collection(db, "sales"), orderBy("date", "desc"))
      const salesSnapshot = await getDocs(salesQuery)
      const salesList = salesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setSales(salesList)
      setFilteredSales(salesList)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching sales:", error)
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return `₹${Number.parseFloat(amount).toFixed(2)}`
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A"
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString("en-IN")
  }

  const renderSaleItem = ({ item }) => (
    <TouchableOpacity style={styles.saleItem} onPress={() => navigation.navigate("SaleDetails", { saleId: item.id })}>
      <View style={styles.saleInfo}>
        <Text style={styles.saleCustomer}>{item.customerName || "Walk-in Customer"}</Text>
        <Text style={styles.saleDate}>{formatDate(item.date)}</Text>
        <Text style={styles.saleItems}>{item.items ? `${item.items.length} items` : "No items"}</Text>
      </View>
      <View style={styles.saleAmount}>
        <Text style={styles.saleTotal}>{formatCurrency(item.totalAmount || 0)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: "#198754" }]}>
          <Text style={styles.statusText}>Paid</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#212529" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sales</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("NewSale")}>
            <Ionicons name="add" size={24} color="#0d6efd" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6c757d" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by customer name or invoice number"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0d6efd" />
            <Text style={styles.loadingText}>Loading sales...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredSales}
            renderItem={renderSaleItem}
            keyExtractor={(item) => item.id}
            style={styles.salesList}
            contentContainerStyle={styles.salesListContent}
            ListEmptyComponent={
              <Text style={styles.emptyText}>{searchQuery ? "No sales match your search" : "No sales found"}</Text>
            }
          />
        )}
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
  addButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    margin: 16,
    paddingHorizontal: 12,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6c757d",
  },
  salesList: {
    flex: 1,
  },
  salesListContent: {
    padding: 16,
  },
  saleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  saleInfo: {
    flex: 1,
  },
  saleCustomer: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 4,
  },
  saleDate: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 4,
  },
  saleItems: {
    fontSize: 14,
    color: "#6c757d",
  },
  saleAmount: {
    alignItems: "flex-end",
  },
  saleTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 8,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "500",
  },
  emptyText: {
    textAlign: "center",
    color: "#6c757d",
    padding: 32,
    backgroundColor: "#ffffff",
    borderRadius: 8,
  },
})

export default Sales

