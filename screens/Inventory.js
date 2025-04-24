// "use client"

// import { useState, useEffect } from "react"
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   FlatList,
//   TextInput,
//   Alert,
//   SafeAreaView,
//   StatusBar,
//   ActivityIndicator,
// } from "react-native"
// import { Ionicons } from "@expo/vector-icons"
// import { collection, getDocs, doc, deleteDoc } from "firebase/firestore"
// import { db } from "../firebaseConfig"

// const Inventory = ({ navigation }) => {
//   const [products, setProducts] = useState([])
//   const [filteredProducts, setFilteredProducts] = useState([])
//   const [searchQuery, setSearchQuery] = useState("")
//   const [loading, setLoading] = useState(true)
//   const [sortBy, setSortBy] = useState("name")
//   const [sortOrder, setSortOrder] = useState("asc")

//   useEffect(() => {
//     const unsubscribe = navigation.addListener("focus", () => {
//       fetchProducts()
//     })

//     return unsubscribe
//   }, [navigation])

//   useEffect(() => {
//     if (searchQuery) {
//       const filtered = products.filter(
//         (product) =>
//           product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           (product.manufacturer && product.manufacturer.toLowerCase().includes(searchQuery.toLowerCase())) ||
//           (product.barcode && product.barcode.includes(searchQuery)),
//       )
//       setFilteredProducts(filtered)
//     } else {
//       setFilteredProducts(products)
//     }
//   }, [searchQuery, products])

//   useEffect(() => {
//     sortProducts()
//   }, [sortBy, sortOrder, filteredProducts])

//   const fetchProducts = async () => {
//     try {
//       const productsSnapshot = await getDocs(collection(db, "products"))
//       const productsList = productsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
//       setProducts(productsList)
//       setFilteredProducts(productsList)
//       setLoading(false)
//     } catch (error) {
//       console.error("Error fetching products:", error)
//       Alert.alert("Error", "Failed to load products")
//       setLoading(false)
//     }
//   }

//   const sortProducts = () => {
//     const sorted = [...filteredProducts].sort((a, b) => {
//       let valueA = a[sortBy]
//       let valueB = b[sortBy]

//       // Handle null or undefined values
//       if (valueA === null || valueA === undefined) valueA = ""
//       if (valueB === null || valueB === undefined) valueB = ""

//       // Convert to string for comparison if not numbers
//       if (typeof valueA !== "number") valueA = String(valueA).toLowerCase()
//       if (typeof valueB !== "number") valueB = String(valueB).toLowerCase()

//       if (sortOrder === "asc") {
//         return valueA > valueB ? 1 : -1
//       } else {
//         return valueA < valueB ? 1 : -1
//       }
//     })

//     setFilteredProducts(sorted)
//   }

//   const toggleSortOrder = (field) => {
//     if (sortBy === field) {
//       setSortOrder(sortOrder === "asc" ? "desc" : "asc")
//     } else {
//       setSortBy(field)
//       setSortOrder("asc")
//     }
//   }

//   const handleDeleteProduct = async (productId) => {
//     Alert.alert("Confirm Delete", "Are you sure you want to delete this product?", [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Delete",
//         style: "destructive",
//         onPress: async () => {
//           try {
//             await deleteDoc(doc(db, "products", productId))
//             fetchProducts()
//             Alert.alert("Success", "Product deleted successfully")
//           } catch (error) {
//             console.error("Error deleting product:", error)
//             Alert.alert("Error", "Failed to delete product")
//           }
//         },
//       },
//     ])
//   }

//   const renderProductItem = ({ item }) => (
//     <TouchableOpacity
//       style={styles.productItem}
//       onPress={() => navigation.navigate("EditProduct", { productId: item.id })}
//     >
//       <View style={styles.productInfo}>
//         <Text style={styles.productName}>{item.name}</Text>
//         <Text style={styles.productDetails}>
//           {item.manufacturer || "Unknown manufacturer"} • {item.category || "General"}
//         </Text>
//       </View>
//       <View style={styles.productMetrics}>
//         <Text style={styles.productPrice}>₹{item.price?.toFixed(2) || "0.00"}</Text>
//         <Text
//           style={[styles.productStock, (item.quantity || 0) <= (item.lowStockThreshold || 10) ? styles.lowStock : null]}
//         >
//           Stock: {item.quantity || 0}
//         </Text>
//         <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteProduct(item.id)}>
//           <Ionicons name="trash-outline" size={20} color="#dc3545" />
//         </TouchableOpacity>
//       </View>
//     </TouchableOpacity>
//   )

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
//       <View style={styles.container}>
//         <View style={styles.header}>
//           <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//             <Ionicons name="arrow-back" size={24} color="#212529" />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Inventory</Text>
//           <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("AddProduct")}>
//             <Ionicons name="add" size={24} color="#0d6efd" />
//           </TouchableOpacity>
//         </View>

//         <View style={styles.searchContainer}>
//           <Ionicons name="search" size={20} color="#6c757d" style={styles.searchIcon} />
//           <TextInput
//             style={styles.searchInput}
//             placeholder="Search products by name, manufacturer or barcode"
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//           />
//         </View>

//         <View style={styles.sortContainer}>
//           <Text style={styles.sortLabel}>Sort by:</Text>
//           <TouchableOpacity
//             style={[styles.sortButton, sortBy === "name" && styles.activeSortButton]}
//             onPress={() => toggleSortOrder("name")}
//           >
//             <Text style={[styles.sortButtonText, sortBy === "name" && styles.activeSortButtonText]}>
//               Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.sortButton, sortBy === "price" && styles.activeSortButton]}
//             onPress={() => toggleSortOrder("price")}
//           >
//             <Text style={[styles.sortButtonText, sortBy === "price" && styles.activeSortButtonText]}>
//               Price {sortBy === "price" && (sortOrder === "asc" ? "↑" : "↓")}
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.sortButton, sortBy === "quantity" && styles.activeSortButton]}
//             onPress={() => toggleSortOrder("quantity")}
//           >
//             <Text style={[styles.sortButtonText, sortBy === "quantity" && styles.activeSortButtonText]}>
//               Stock {sortBy === "quantity" && (sortOrder === "asc" ? "↑" : "↓")}
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {loading ? (
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator size="large" color="#0d6efd" />
//             <Text style={styles.loadingText}>Loading products...</Text>
//           </View>
//         ) : (
//           <FlatList
//             data={filteredProducts}
//             renderItem={renderProductItem}
//             keyExtractor={(item) => item.id}
//             style={styles.productsList}
//             contentContainerStyle={styles.productsListContent}
//             ListEmptyComponent={
//               <Text style={styles.emptyText}>
//                 {searchQuery ? "No products match your search" : "No products found"}
//               </Text>
//             }
//           />
//         )}
//       </View>
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
//   addButton: {
//     padding: 8,
//   },
//   searchContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#ffffff",
//     borderRadius: 8,
//     margin: 16,
//     paddingHorizontal: 12,
//     elevation: 1,
//   },
//   searchIcon: {
//     marginRight: 8,
//   },
//   searchInput: {
//     flex: 1,
//     height: 48,
//     fontSize: 16,
//     color: "#212529",
//   },
//   sortContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     marginBottom: 16,
//   },
//   sortLabel: {
//     fontSize: 14,
//     color: "#6c757d",
//     marginRight: 8,
//   },
//   sortButton: {
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 4,
//     marginRight: 8,
//     backgroundColor: "#f8f9fa",
//     borderWidth: 1,
//     borderColor: "#ced4da",
//   },
//   activeSortButton: {
//     backgroundColor: "#0d6efd",
//     borderColor: "#0d6efd",
//   },
//   sortButtonText: {
//     fontSize: 14,
//     color: "#212529",
//   },
//   activeSortButtonText: {
//     color: "#ffffff",
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   loadingText: {
//     marginTop: 16,
//     fontSize: 16,
//     color: "#6c757d",
//   },
//   productsList: {
//     flex: 1,
//   },
//   productsListContent: {
//     padding: 16,
//     paddingTop: 0,
//   },
//   productItem: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     backgroundColor: "#ffffff",
//     borderRadius: 8,
//     padding: 16,
//     marginBottom: 12,
//     elevation: 1,
//   },
//   productInfo: {
//     flex: 1,
//   },
//   productName: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#212529",
//     marginBottom: 4,
//   },
//   productDetails: {
//     fontSize: 14,
//     color: "#6c757d",
//   },
//   productMetrics: {
//     alignItems: "flex-end",
//   },
//   productPrice: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#212529",
//     marginBottom: 4,
//   },
//   productStock: {
//     fontSize: 14,
//     color: "#198754",
//     marginBottom: 8,
//   },
//   lowStock: {
//     color: "#dc3545",
//   },
//   deleteButton: {
//     padding: 4,
//   },
//   emptyText: {
//     textAlign: "center",
//     color: "#6c757d",
//     padding: 32,
//     backgroundColor: "#ffffff",
//     borderRadius: 8,
//   },
// })

// export default Inventory

import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { collection, getDocs, doc, deleteDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Inventory = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOption, setFilterOption] = useState('all');
  const [sortOption, setSortOption] = useState('name');

  // Use useCallback to prevent recreation of this function on every render
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      // Build query based on sort option
      let productsQuery = collection(db, 'products');
      
      if (sortOption) {
        productsQuery = query(productsQuery, orderBy(sortOption));
      }
      
      const querySnapshot = await getDocs(productsQuery);
      
      let productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Safely handle date conversion
        expiryDate: doc.data().expiryDate && typeof doc.data().expiryDate.toDate === 'function' 
          ? doc.data().expiryDate.toDate() 
          : null
      }));
      
      // Apply filters
      if (filterOption === 'lowStock') {
        productsData = productsData.filter(product => product.quantity < 10);
      } else if (filterOption === 'expiringSoon') {
        const threeMonthsLater = new Date();
        threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
        
        productsData = productsData.filter(product => 
          product.expiryDate && product.expiryDate <= threeMonthsLater
        );
      }
      
      // Apply search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        productsData = productsData.filter(product => 
          product.name?.toLowerCase().includes(query) || 
          product.category?.toLowerCase().includes(query)
        );
      }
      
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
      Alert.alert("Error", "Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterOption, sortOption]); // Dependencies for useCallback

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProducts();
    });

    return unsubscribe;
  }, [navigation, fetchProducts]);

  const handleDeleteProduct = async (productId) => {
    Alert.alert(
      "Delete Product",
      "Are you sure you want to delete this product?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'products', productId));
              // Refresh products list after deletion
              fetchProducts();
            } catch (error) {
              console.error("Error deleting product:", error);
              Alert.alert("Error", "Failed to delete product. Please try again.");
            }
          }
        }
      ]
    );
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const renderProductItem = ({ item }) => {
    const isLowStock = item.quantity < 10;
    const isExpired = item.expiryDate && item.expiryDate < new Date();
    
    return (
      <View style={styles.productCard}>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productCategory}>{item.category}</Text>
          <View style={styles.productDetails}>
            <Text style={styles.productDetail}>
              Price: ${parseFloat(item.price).toFixed(2)}
            </Text>
            <Text style={[
              styles.productDetail, 
              isLowStock ? styles.lowStockText : null
            ]}>
              Stock: {item.quantity} {isLowStock && '(Low)'}
            </Text>
            <Text style={[
              styles.productDetail,
              isExpired ? styles.expiredText : null
            ]}>
              Expires: {formatDate(item.expiryDate)}
              {isExpired && ' (Expired)'}
            </Text>
          </View>
        </View>
        
        <View style={styles.productActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={() => navigation.navigate('EditProduct', { productId: item.id })}
          >
            <Icon name="edit" size={16} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteProduct(item.id)}
          >
            <Icon name="delete" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inventory</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddProduct')}>
          <Icon name="add-circle" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#757575" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={fetchProducts}
        />
      </View>
      
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            filterOption === 'all' ? styles.activeFilterButton : null
          ]}
          onPress={() => {
            setFilterOption('all');
            // Don't call fetchProducts here, let the dependency trigger it
          }}
        >
          <Text style={filterOption === 'all' ? styles.activeFilterText : null}>All</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            filterOption === 'lowStock' ? styles.activeFilterButton : null
          ]}
          onPress={() => {
            setFilterOption('lowStock');
            // Don't call fetchProducts here, let the dependency trigger it
          }}
        >
          <Text style={filterOption === 'lowStock' ? styles.activeFilterText : null}>Low Stock</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            filterOption === 'expiringSoon' ? styles.activeFilterButton : null
          ]}
          onPress={() => {
            setFilterOption('expiringSoon');
            // Don't call fetchProducts here, let the dependency trigger it
          }}
        >
          <Text style={filterOption === 'expiringSoon' ? styles.activeFilterText : null}>Expiring Soon</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <TouchableOpacity 
          style={styles.sortButton}
          onPress={() => {
            setSortOption(sortOption === 'name' ? 'name' : 'name');
            // Don't call fetchProducts here, let the dependency trigger it
          }}
        >
          <Text style={sortOption === 'name' ? styles.activeSortText : null}>Name</Text>
          {sortOption === 'name' && <Icon name="check" size={16} color="#4CAF50" />}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.sortButton}
          onPress={() => {
            setSortOption(sortOption === 'price' ? 'price' : 'price');
            // Don't call fetchProducts here, let the dependency trigger it
          }}
        >
          <Text style={sortOption === 'price' ? styles.activeSortText : null}>Price</Text>
          {sortOption === 'price' && <Icon name="check" size={16} color="#4CAF50" />}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.sortButton}
          onPress={() => {
            setSortOption(sortOption === 'quantity' ? 'quantity' : 'quantity');
            // Don't call fetchProducts here, let the dependency trigger it
          }}
        >
          <Text style={sortOption === 'quantity' ? styles.activeSortText : null}>Stock</Text>
          {sortOption === 'quantity' && <Icon name="check" size={16} color="#4CAF50" />}
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.productsList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="inventory" size={64} color="#E0E0E0" />
              <Text style={styles.emptyText}>No products found</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => navigation.navigate('AddProduct')}
              >
                <Text style={styles.addButtonText}>Add Product</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
      
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('AddProduct')}
      >
        <Icon name="add" size={24} color="#fff" />
      </TouchableOpacity>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 4,
    margin: 15,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
  },
  activeFilterButton: {
    backgroundColor: '#4CAF50',
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: '500',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  sortLabel: {
    marginRight: 10,
    color: '#757575',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  activeSortText: {
    color: '#4CAF50',
    fontWeight: '500',
    marginRight: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4CAF50',
  },
  productsList: {
    padding: 15,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  productCategory: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  productDetails: {
    marginTop: 5,
  },
  productDetail: {
    fontSize: 14,
    marginBottom: 3,
  },
  lowStockText: {
    color: '#FF9800',
  },
  expiredText: {
    color: '#F44336',
  },
  productActions: {
    justifyContent: 'center',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    marginVertical: 10,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#4CAF50',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default Inventory;