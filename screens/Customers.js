"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  Modal,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { collection, getDocs, addDoc, doc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../firebaseConfig"

const Customers = ({ navigation }) => {
  const [customers, setCustomers] = useState([])
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  })

  useEffect(() => {
    fetchCustomers()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (customer.phone && customer.phone.includes(searchQuery)),
      )
      setFilteredCustomers(filtered)
    } else {
      setFilteredCustomers(customers)
    }
  }, [searchQuery, customers])

  const fetchCustomers = async () => {
    try {
      const customersSnapshot = await getDocs(collection(db, "customers"))
      const customersList = customersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setCustomers(customersList)
      setFilteredCustomers(customersList)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching customers:", error)
      Alert.alert("Error", "Failed to load customers")
      setLoading(false)
    }
  }

  const handleAddCustomer = async () => {
    if (!newCustomer.name.trim()) {
      Alert.alert("Error", "Customer name is required")
      return
    }

    try {
      const customerData = {
        name: newCustomer.name.trim(),
        phone: newCustomer.phone.trim() || null,
        email: newCustomer.email.trim() || null,
        address: newCustomer.address.trim() || null,
        createdAt: serverTimestamp(),
      }

      await addDoc(collection(db, "customers"), customerData)

      setModalVisible(false)
      setNewCustomer({ name: "", phone: "", email: "", address: "" })
      fetchCustomers()

      Alert.alert("Success", "Customer added successfully")
    } catch (error) {
      console.error("Error adding customer:", error)
      Alert.alert("Error", "Failed to add customer")
    }
  }

  const handleDeleteCustomer = async (customerId) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this customer?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "customers", customerId))
            fetchCustomers()
            Alert.alert("Success", "Customer deleted successfully")
          } catch (error) {
            console.error("Error deleting customer:", error)
            Alert.alert("Error", "Failed to delete customer")
          }
        },
      },
    ])
  }

  const renderCustomerItem = ({ item }) => (
    <View style={styles.customerItem}>
      <View style={styles.customerInfo}>
        <Text style={styles.customerName}>{item.name}</Text>
        {item.phone && (
          <Text style={styles.customerDetail}>
            <Ionicons name="call-outline" size={14} color="#6c757d" /> {item.phone}
          </Text>
        )}
        {item.email && (
          <Text style={styles.customerDetail}>
            <Ionicons name="mail-outline" size={14} color="#6c757d" /> {item.email}
          </Text>
        )}
        {item.address && (
          <Text style={styles.customerDetail}>
            <Ionicons name="location-outline" size={14} color="#6c757d" /> {item.address}
          </Text>
        )}
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteCustomer(item.id)}>
        <Ionicons name="trash-outline" size={20} color="#dc3545" />
      </TouchableOpacity>
    </View>
  )

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#212529" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Customers</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Ionicons name="add" size={24} color="#0d6efd" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6c757d" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search customers by name or phone"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0d6efd" />
            <Text style={styles.loadingText}>Loading customers...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredCustomers}
            renderItem={renderCustomerItem}
            keyExtractor={(item) => item.id}
            style={styles.customersList}
            contentContainerStyle={styles.customersListContent}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                {searchQuery ? "No customers match your search" : "No customers found"}
              </Text>
            }
          />
        )}

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Customer</Text>
                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#212529" />
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Name *</Text>
                <TextInput
                  style={styles.input}
                  value={newCustomer.name}
                  onChangeText={(text) => setNewCustomer({ ...newCustomer, name: text })}
                  placeholder="Enter customer name"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Phone</Text>
                <TextInput
                  style={styles.input}
                  value={newCustomer.phone}
                  onChangeText={(text) => setNewCustomer({ ...newCustomer, phone: text })}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={newCustomer.email}
                  onChangeText={(text) => setNewCustomer({ ...newCustomer, email: text })}
                  placeholder="Enter email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Address</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newCustomer.address}
                  onChangeText={(text) => setNewCustomer({ ...newCustomer, address: text })}
                  placeholder="Enter address"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleAddCustomer}>
                <Text style={styles.saveButtonText}>Save Customer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  customersList: {
    flex: 1,
  },
  customersListContent: {
    padding: 16,
  },
  customerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 8,
  },
  customerDetail: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 4,
  },
  deleteButton: {
    padding: 8,
  },
  emptyText: {
    textAlign: "center",
    color: "#6c757d",
    padding: 32,
    backgroundColor: "#ffffff",
    borderRadius: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#212529",
  },
  closeButton: {
    padding: 4,
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
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#212529",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#0d6efd",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default Customers

