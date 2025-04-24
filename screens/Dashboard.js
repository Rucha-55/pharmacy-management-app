import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { collection, getDocs, query, where, orderBy, limit, onSnapshot, startAfter, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getAuth, signOut } from 'firebase/auth';

const Dashboard = ({ navigation }) => {
  const auth = getAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    expiringItems: 0,
    totalSales: 0,
    totalCustomers: 0,
  })
  const [recentSales, setRecentSales] = useState([])
  const [menuVisible, setMenuVisible] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastVisible, setLastVisible] = useState(null)
  const [hasMoreSales, setHasMoreSales] = useState(true)

  // Cache duration in milliseconds (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000
  const [lastFetchTime, setLastFetchTime] = useState(0)
  const [unsubscribeListeners, setUnsubscribeListeners] = useState([])

  useEffect(() => {
    // Initial data fetch
    fetchDashboardData()
    
    // Set up real-time listeners for critical data
    setupRealtimeListeners()
    
    // Cleanup listeners on component unmount
    return () => {
      unsubscribeListeners.forEach(unsubscribe => unsubscribe())
    }
  }, [])

  const setupRealtimeListeners = () => {
    // Listen for low stock products
    const lowStockUnsubscribe = onSnapshot(
      query(collection(db, "products"), where("quantity", "<=", 10)),
      (snapshot) => {
        setStats(prevStats => ({
          ...prevStats,
          lowStock: snapshot.size
        }))
      }
    )
    
    // Listen for recent sales
    const recentSalesUnsubscribe = onSnapshot(
      query(collection(db, "sales"), orderBy("date", "desc"), limit(5)),
      (snapshot) => {
        const recentSalesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate() || new Date(),
        }))
        setRecentSales(recentSalesData)
        
        // Update last visible document for pagination
        if (snapshot.docs.length > 0) {
          setLastVisible(snapshot.docs[snapshot.docs.length - 1])
          setHasMoreSales(snapshot.docs.length === 5)
        }
      }
    )
    
    setUnsubscribeListeners([lowStockUnsubscribe, recentSalesUnsubscribe])
  }

  const shouldRefetchData = () => {
    const now = Date.now()
    return now - lastFetchTime > CACHE_DURATION
  }

  const fetchDashboardData = async (forceRefresh = false) => {
    try {
      if (!forceRefresh && !shouldRefetchData()) {
        setLoading(false)
        return
      }

      setLoading(true)
      setIsRefreshing(true)

      // Fetch data in parallel using Promise.all
      const [
        productsSnapshot,
        customersSnapshot,
        salesSnapshot
      ] = await Promise.all([
        getDocs(collection(db, "products")),
        getDocs(collection(db, "customers")),
        getDocs(collection(db, "sales"))
      ])

      // Process products data
      const totalProducts = productsSnapshot.size
      const lowStockItems = productsSnapshot.docs.filter((doc) => doc.data().quantity <= doc.data().reorderLevel).length
      
      const today = new Date()
      const ninetyDaysFromNow = new Date()
      ninetyDaysFromNow.setDate(today.getDate() + 90)

      const expiringItems = productsSnapshot.docs.filter((doc) => {
        const expiryDate = doc.data().expiryDate?.toDate()
        return expiryDate && expiryDate <= ninetyDaysFromNow
      }).length

      // Process customers data
      const totalCustomers = customersSnapshot.size

      // Process sales data
      let totalSalesAmount = 0
      salesSnapshot.docs.forEach((doc) => {
        totalSalesAmount += doc.data().totalAmount || 0
      })

      // Get recent sales (first page)
      const recentSalesQuery = query(collection(db, "sales"), orderBy("date", "desc"), limit(5))
      const recentSalesSnapshot = await getDocs(recentSalesQuery)
      const recentSalesData = recentSalesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date(),
      }))

      setStats({
        totalProducts,
        lowStock: lowStockItems,
        expiringItems,
        totalSales: totalSalesAmount,
        totalCustomers,
      })

      setRecentSales(recentSalesData)
      
      // Update last visible document for pagination
      if (recentSalesSnapshot.docs.length > 0) {
        setLastVisible(recentSalesSnapshot.docs[recentSalesSnapshot.docs.length - 1])
        setHasMoreSales(recentSalesSnapshot.docs.length === 5)
      }
      
      setLastFetchTime(Date.now())
      setLoading(false)
      setIsRefreshing(false)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  const loadMoreSales = async () => {
    if (!lastVisible || !hasMoreSales) return
    
    try {
      const moreSalesQuery = query(
        collection(db, "sales"), 
        orderBy("date", "desc"), 
        startAfter(lastVisible),
        limit(5)
      )
      
      const moreSalesSnapshot = await getDocs(moreSalesQuery)
      const moreSalesData = moreSalesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date(),
      }))
      
      setRecentSales(prevSales => [...prevSales, ...moreSalesData])
      
      if (moreSalesSnapshot.docs.length > 0) {
        setLastVisible(moreSalesSnapshot.docs[moreSalesSnapshot.docs.length - 1])
        setHasMoreSales(moreSalesSnapshot.docs.length === 5)
      } else {
        setHasMoreSales(false)
      }
    } catch (error) {
      console.error("Error loading more sales:", error)
    }
  }

  const onRefresh = () => {
    fetchDashboardData(true)
  }

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("User logged out")
        navigation.replace("Login")
      })
      .catch((error) => {
        console.error("Logout failed:", error.message)
      })
  }

  const navigateTo = (screen) => {
    setMenuVisible(false)
    navigation.navigate(screen)
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Navinya Medical</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(!menuVisible)}>
            <Icon name="menu" size={24} color="#2e7d32" />
          </TouchableOpacity>
        </View>
      </View>

      {menuVisible && (
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo("Inventory")}>
            <Icon name="package" size={20} color="#2e7d32" />
            <Text style={styles.menuText}>Inventory</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo("Sales")}>
            <Icon name="trending-up" size={20} color="#2e7d32" />
            <Text style={styles.menuText}>Sales</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo("Customers")}>
            <Icon name="people" size={20} color="#2e7d32" />
            <Text style={styles.menuText}>Customers</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo("Prescriptions")}>
            <Icon name="description" size={20} color="#2e7d32" />
            <Text style={styles.menuText}>Prescriptions</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo("Reports")}>
            <Icon name="assessment" size={20} color="#2e7d32" />
            <Text style={styles.menuText}>Reports</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <Icon name="logout" size={20} color="#d32f2f" />
            <Text style={[styles.menuText, { color: "#d32f2f" }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView 
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={["#2e7d32"]}
            tintColor="#2e7d32"
          />
        }
      >
        <Text style={styles.sectionTitle}>Dashboard Overview</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalProducts}</Text>
            <Text style={styles.statLabel}>Total Products</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.lowStock}</Text>
            <Text style={styles.statLabel}>Low Stock Items</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.expiringItems}</Text>
            <Text style={styles.statLabel}>Expiring Soon</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>₹{stats.totalSales.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Sales</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalCustomers}</Text>
            <Text style={styles.statLabel}>Customers</Text>
          </View>
        </View>

        <View style={styles.alertsContainer}>
          {stats.lowStock > 0 && (
            <View style={styles.alertCard}>
              <Icon name="warning" size={20} color="#ff9800" />
              <Text style={styles.alertText}>{stats.lowStock} products are low in stock</Text>
            </View>
          )}

          {stats.expiringItems > 0 && (
            <View style={styles.alertCard}>
              <Icon name="warning" size={20} color="#ff9800" />
              <Text style={styles.alertText}>{stats.expiringItems} products are expiring soon</Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Recent Sales</Text>

        {recentSales.length > 0 ? (
          <View style={styles.recentSalesContainer}>
            {recentSales.map((sale) => (
              <View key={sale.id} style={styles.saleItem}>
                <View>
                  <Text style={styles.saleItemTitle}>Invoice #{sale.invoiceNumber || sale.id.substring(0, 6)}</Text>
                  <Text style={styles.saleItemDate}>{sale.date.toDateString()}</Text>
                </View>
                <Text style={styles.saleItemAmount}>₹{sale.totalAmount?.toLocaleString() || "0"}</Text>
              </View>
            ))}
            
            {hasMoreSales && (
              <TouchableOpacity 
                style={styles.loadMoreButton} 
                onPress={loadMoreSales}
              >
                <Text style={styles.loadMoreButtonText}>Load More</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No recent sales</Text>
          </View>
        )}

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("NewSale")}>
            <Text style={styles.actionButtonText}>New Sale</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("AddProduct")}>
            <Text style={styles.actionButtonText}>Add Product</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#2e7d32",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2e7d32",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuButton: {
    padding: 8,
  },
  menuContainer: {
    position: "absolute",
    top: 60,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#424242",
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#424242",
    marginBottom: 16,
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 4,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2e7d32",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#616161",
    textAlign: "center",
  },
  alertsContainer: {
    marginBottom: 16,
  },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff3e0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  alertText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#e65100",
  },
  recentSalesContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
  },
  saleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  saleItemTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#424242",
  },
  saleItemDate: {
    fontSize: 13,
    color: "#757575",
    marginTop: 2,
  },
  saleItemAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2e7d32",
  },
  emptyStateContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#9e9e9e",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#2e7d32",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  loadMoreButton: {
    padding: 12,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  loadMoreButtonText: {
    color: "#2e7d32",
    fontSize: 14,
    fontWeight: "500",
  },
})

export default Dashboard
