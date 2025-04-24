"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "../firebaseConfig"

const Reports = ({ navigation }) => {
  const [loading, setLoading] = useState(true)
  const [salesData, setSalesData] = useState({
    today: { count: 0, total: 0 },
    week: { count: 0, total: 0 },
    month: { count: 0, total: 0 },
  })
  const [topProducts, setTopProducts] = useState([])
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [reportPeriod, setReportPeriod] = useState("month") // "today", "week", "month"

  useEffect(() => {
    fetchReportData()
  }, [reportPeriod])

  const fetchReportData = async () => {
    setLoading(true)
    try {
      // Fetch sales data
      await fetchSalesData()

      // Fetch top products
      await fetchTopProducts()

      // Fetch low stock products
      await fetchLowStockProducts()

      setLoading(false)
    } catch (error) {
      console.error("Error fetching report data:", error)
      setLoading(false)
    }
  }

  const fetchSalesData = async () => {
    try {
      const today = new Date()

      // Calculate date ranges
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())

      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay())

      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

      // Fetch sales for today
      const todaySalesSnapshot = await getDocs(query(collection(db, "sales"), where("date", ">=", startOfToday)))

      // Fetch sales for this week
      const weekSalesSnapshot = await getDocs(query(collection(db, "sales"), where("date", ">=", startOfWeek)))

      // Fetch sales for this month
      const monthSalesSnapshot = await getDocs(query(collection(db, "sales"), where("date", ">=", startOfMonth)))

      // Calculate totals
      const todayData = calculateSalesData(todaySalesSnapshot)
      const weekData = calculateSalesData(weekSalesSnapshot)
      const monthData = calculateSalesData(monthSalesSnapshot)

      setSalesData({
        today: todayData,
        week: weekData,
        month: monthData,
      })
    } catch (error) {
      console.error("Error fetching sales data:", error)
    }
  }

  const calculateSalesData = (snapshot) => {
    let total = 0
    snapshot.docs.forEach((doc) => {
      const saleData = doc.data()
      total += saleData.totalAmount || 0
    })

    return {
      count: snapshot.docs.length,
      total: total,
    }
  }

  const fetchTopProducts = async () => {
    try {
      // This is a simplified approach - in a real app, you would aggregate this data on the server
      const salesSnapshot = await getDocs(collection(db, "sales"))

      // Create a map to count product sales
      const productSales = {}

      salesSnapshot.docs.forEach((doc) => {
        const saleData = doc.data()
        if (saleData.items && Array.isArray(saleData.items)) {
          saleData.items.forEach((item) => {
            if (!productSales[item.productId]) {
              productSales[item.productId] = {
                id: item.productId,
                name: item.name,
                quantity: 0,
                revenue: 0,
              }
            }
            productSales[item.productId].quantity += item.quantity
            productSales[item.productId].revenue += item.subtotal
          })
        }
      })

      // Convert to array and sort by quantity sold
      const sortedProducts = Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5)

      setTopProducts(sortedProducts)
    } catch (error) {
      console.error("Error fetching top products:", error)
    }
  }

  const fetchLowStockProducts = async () => {
    try {
      const productsSnapshot = await getDocs(collection(db, "products"))

      const lowStock = productsSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((product) => (product.quantity || 0) < (product.lowStockThreshold || 10))
        .sort((a, b) => (a.quantity || 0) - (b.quantity || 0))
        .slice(0, 5)

      setLowStockProducts(lowStock)
    } catch (error) {
      console.error("Error fetching low stock products:", error)
    }
  }

  const formatCurrency = (amount) => {
    return `₹${Number.parseFloat(amount).toFixed(2)}`
  }

  const getCurrentReportData = () => {
    switch (reportPeriod) {
      case "today":
        return salesData.today
      case "week":
        return salesData.week
      case "month":
        return salesData.month
      default:
        return salesData.month
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#212529" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reports</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchReportData}>
            <Ionicons name="refresh" size={24} color="#0d6efd" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0d6efd" />
            <Text style={styles.loadingText}>Loading report data...</Text>
          </View>
        ) : (
          <ScrollView style={styles.content}>
            <View style={styles.periodSelector}>
              <TouchableOpacity
                style={[styles.periodButton, reportPeriod === "today" && styles.activePeriodButton]}
                onPress={() => setReportPeriod("today")}
              >
                <Text style={[styles.periodButtonText, reportPeriod === "today" && styles.activePeriodButtonText]}>
                  Today
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.periodButton, reportPeriod === "week" && styles.activePeriodButton]}
                onPress={() => setReportPeriod("week")}
              >
                <Text style={[styles.periodButtonText, reportPeriod === "week" && styles.activePeriodButtonText]}>
                  This Week
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.periodButton, reportPeriod === "month" && styles.activePeriodButton]}
                onPress={() => setReportPeriod("month")}
              >
                <Text style={[styles.periodButtonText, reportPeriod === "month" && styles.activePeriodButtonText]}>
                  This Month
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.summaryContainer}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Total Sales</Text>
                <Text style={styles.summaryValue}>{formatCurrency(getCurrentReportData().total)}</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Number of Sales</Text>
                <Text style={styles.summaryValue}>{getCurrentReportData().count}</Text>
              </View>
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Top Selling Products</Text>
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <View key={product.id} style={styles.listItem}>
                    <View style={styles.listItemContent}>
                      <Text style={styles.listItemTitle}>{product.name}</Text>
                      <Text style={styles.listItemSubtitle}>Sold: {product.quantity} units</Text>
                    </View>
                    <Text style={styles.listItemAmount}>{formatCurrency(product.revenue)}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No sales data available</Text>
              )}
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Low Stock Alert</Text>
              {lowStockProducts.length > 0 ? (
                lowStockProducts.map((product, index) => (
                  <TouchableOpacity
                    key={product.id}
                    style={styles.listItem}
                    onPress={() => navigation.navigate("EditProduct", { productId: product.id })}
                  >
                    <View style={styles.listItemContent}>
                      <Text style={styles.listItemTitle}>{product.name}</Text>
                      <Text style={styles.listItemSubtitle}>{product.manufacturer || "Unknown manufacturer"}</Text>
                    </View>
                    <Text style={[styles.stockText, { color: "#dc3545" }]}>Stock: {product.quantity || 0}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.emptyText}>No low stock items</Text>
              )}
            </View>
          </ScrollView>
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
  refreshButton: {
    padding: 8,
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
  content: {
    flex: 1,
    padding: 16,
  },
  periodSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#ced4da",
    marginHorizontal: 4,
    borderRadius: 8,
  },
  activePeriodButton: {
    backgroundColor: "#0d6efd",
    borderColor: "#0d6efd",
  },
  periodButtonText: {
    color: "#212529",
    fontWeight: "500",
  },
  activePeriodButtonText: {
    color: "#ffffff",
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#212529",
  },
  sectionContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 16,
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    color: "#212529",
  },
  listItemSubtitle: {
    fontSize: 14,
    color: "#6c757d",
    marginTop: 4,
  },
  listItemAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#198754",
  },
  stockText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    color: "#6c757d",
    padding: 16,
  },
})

export default Reports

