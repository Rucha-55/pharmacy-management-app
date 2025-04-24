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
  Image,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { collection, getDocs, addDoc, doc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../firebaseConfig"

const Prescriptions = ({ navigation }) => {
  const [prescriptions, setPrescriptions] = useState([])
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [newPrescription, setNewPrescription] = useState({
    patientName: "",
    doctorName: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  })
  const [selectedPrescription, setSelectedPrescription] = useState(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)

  useEffect(() => {
    fetchPrescriptions()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = prescriptions.filter(
        (prescription) =>
          prescription.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          prescription.doctorName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredPrescriptions(filtered)
    } else {
      setFilteredPrescriptions(prescriptions)
    }
  }, [searchQuery, prescriptions])

  const fetchPrescriptions = async () => {
    try {
      const prescriptionsSnapshot = await getDocs(collection(db, "prescriptions"))
      const prescriptionsList = prescriptionsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setPrescriptions(prescriptionsList)
      setFilteredPrescriptions(prescriptionsList)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching prescriptions:", error)
      Alert.alert("Error", "Failed to load prescriptions")
      setLoading(false)
    }
  }

  const handleAddPrescription = async () => {
    if (!newPrescription.patientName.trim()) {
      Alert.alert("Error", "Patient name is required")
      return
    }

    try {
      const prescriptionData = {
        patientName: newPrescription.patientName.trim(),
        doctorName: newPrescription.doctorName.trim() || "Unknown",
        date: newPrescription.date,
        notes: newPrescription.notes.trim() || "",
        createdAt: serverTimestamp(),
      }

      await addDoc(collection(db, "prescriptions"), prescriptionData)

      setModalVisible(false)
      setNewPrescription({
        patientName: "",
        doctorName: "",
        date: new Date().toISOString().split("T")[0],
        notes: "",
      })
      fetchPrescriptions()

      Alert.alert("Success", "Prescription added successfully")
    } catch (error) {
      console.error("Error adding prescription:", error)
      Alert.alert("Error", "Failed to add prescription")
    }
  }

  const handleDeletePrescription = async (prescriptionId) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this prescription?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "prescriptions", prescriptionId))
            fetchPrescriptions()
            Alert.alert("Success", "Prescription deleted successfully")
          } catch (error) {
            console.error("Error deleting prescription:", error)
            Alert.alert("Error", "Failed to delete prescription")
          }
        },
      },
    ])
  }

  const showPrescriptionDetails = (prescription) => {
    setSelectedPrescription(prescription)
    setDetailModalVisible(true)
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"

    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-IN")
    } catch (error) {
      return dateString
    }
  }

  const renderPrescriptionItem = ({ item }) => (
    <TouchableOpacity style={styles.prescriptionItem} onPress={() => showPrescriptionDetails(item)}>
      <View style={styles.prescriptionInfo}>
        <Text style={styles.patientName}>{item.patientName}</Text>
        <Text style={styles.prescriptionDetail}>
          <Ionicons name="medical-outline" size={14} color="#6c757d" /> {item.doctorName}
        </Text>
        <Text style={styles.prescriptionDetail}>
          <Ionicons name="calendar-outline" size={14} color="#6c757d" /> {formatDate(item.date)}
        </Text>
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeletePrescription(item.id)}>
        <Ionicons name="trash-outline" size={20} color="#dc3545" />
      </TouchableOpacity>
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
          <Text style={styles.headerTitle}>Prescriptions</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Ionicons name="add" size={24} color="#0d6efd" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6c757d" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by patient or doctor name"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0d6efd" />
            <Text style={styles.loadingText}>Loading prescriptions...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredPrescriptions}
            renderItem={renderPrescriptionItem}
            keyExtractor={(item) => item.id}
            style={styles.prescriptionsList}
            contentContainerStyle={styles.prescriptionsListContent}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                {searchQuery ? "No prescriptions match your search" : "No prescriptions found"}
              </Text>
            }
          />
        )}

        {/* Add Prescription Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Prescription</Text>
                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#212529" />
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Patient Name *</Text>
                <TextInput
                  style={styles.input}
                  value={newPrescription.patientName}
                  onChangeText={(text) => setNewPrescription({ ...newPrescription, patientName: text })}
                  placeholder="Enter patient name"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Doctor Name</Text>
                <TextInput
                  style={styles.input}
                  value={newPrescription.doctorName}
                  onChangeText={(text) => setNewPrescription({ ...newPrescription, doctorName: text })}
                  placeholder="Enter doctor name"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Date</Text>
                <TextInput
                  style={styles.input}
                  value={newPrescription.date}
                  onChangeText={(text) => setNewPrescription({ ...newPrescription, date: text })}
                  placeholder="YYYY-MM-DD"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newPrescription.notes}
                  onChangeText={(text) => setNewPrescription({ ...newPrescription, notes: text })}
                  placeholder="Enter prescription notes"
                  multiline
                  numberOfLines={4}
                />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleAddPrescription}>
                <Text style={styles.saveButtonText}>Save Prescription</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Prescription Details Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={detailModalVisible}
          onRequestClose={() => setDetailModalVisible(false)}
        >
          {selectedPrescription && (
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Prescription Details</Text>
                  <TouchableOpacity style={styles.closeButton} onPress={() => setDetailModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#212529" />
                  </TouchableOpacity>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Patient Name</Text>
                  <Text style={styles.detailValue}>{selectedPrescription.patientName}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Doctor Name</Text>
                  <Text style={styles.detailValue}>{selectedPrescription.doctorName}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Date</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedPrescription.date)}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Notes</Text>
                  <Text style={styles.detailValue}>{selectedPrescription.notes || "No notes available"}</Text>
                </View>

                {selectedPrescription.imageUrl && (
                  <View style={styles.imageContainer}>
                    <Text style={styles.detailLabel}>Prescription Image</Text>
                    <Image
                      source={{ uri: selectedPrescription.imageUrl }}
                      style={styles.prescriptionImage}
                      resizeMode="contain"
                    />
                  </View>
                )}
              </View>
            </View>
          )}
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
  prescriptionsList: {
    flex: 1,
  },
  prescriptionsListContent: {
    padding: 16,
  },
  prescriptionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  prescriptionInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 8,
  },
  prescriptionDetail: {
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
    maxHeight: "80%",
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
    height: 100,
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
  detailSection: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: "#212529",
  },
  imageContainer: {
    marginTop: 16,
  },
  prescriptionImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
})

export default Prescriptions

