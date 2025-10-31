import React, { useReducer, useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  ScrollView,
  FlatList,
  Dimensions,
  AccessibilityInfo,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Roboto_400Regular, Roboto_700Bold } from '@expo-google-fonts/roboto';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';

// Enums and Interfaces
enum BloodGroup {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
}

interface Donation {
  id: string;
  date: string;
  location: string;
}

interface Profile {
  name: string;
  bloodGroup: BloodGroup;
  location: string;
  phone?: string;
  profilePic?: string;
  lastDonation?: string;
}

interface ProfileState {
  profile: Profile;
  donationHistory: Donation[];
  loading: boolean;
  error: string | null;
  editModalVisible: boolean;
  editedProfile: Profile;
  currentPage: number;
}

type ProfileAction =
  | { type: 'SET_PROFILE'; payload: Profile }
  | { type: 'SET_DONATION_HISTORY'; payload: Donation[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_EDIT_MODAL_VISIBLE'; payload: boolean }
  | { type: 'SET_EDITED_PROFILE'; payload: Profile }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SAVE_PROFILE' };

const bloodGroups = Object.values(BloodGroup);
const locations = [
  'Shariatpur Sadar',
  'Zajira',
  'Naria',
  'Sokhipur',
  'Gosairhat',
  'Padma Bridge South',
  'Damudya',
  'Bhedargonj',
  'Dhaka',
];

const compatibility = {
  [BloodGroup.A_POSITIVE]: [BloodGroup.A_POSITIVE, BloodGroup.AB_POSITIVE],
  [BloodGroup.A_NEGATIVE]: [
    BloodGroup.A_POSITIVE,
    BloodGroup.A_NEGATIVE,
    BloodGroup.AB_POSITIVE,
    BloodGroup.AB_NEGATIVE,
  ],
  [BloodGroup.B_POSITIVE]: [BloodGroup.B_POSITIVE, BloodGroup.AB_POSITIVE],
  [BloodGroup.B_NEGATIVE]: [
    BloodGroup.B_POSITIVE,
    BloodGroup.B_NEGATIVE,
    BloodGroup.AB_POSITIVE,
    BloodGroup.AB_NEGATIVE,
  ],
  [BloodGroup.AB_POSITIVE]: [BloodGroup.AB_POSITIVE],
  [BloodGroup.AB_NEGATIVE]: [BloodGroup.AB_POSITIVE, BloodGroup.AB_NEGATIVE],
  [BloodGroup.O_POSITIVE]: [
    BloodGroup.A_POSITIVE,
    BloodGroup.B_POSITIVE,
    BloodGroup.AB_POSITIVE,
    BloodGroup.O_POSITIVE,
  ],
  [BloodGroup.O_NEGATIVE]: Object.values(BloodGroup),
};

// Mock data (personalized with your name and current date)
const initialProfile: Profile = {
  name: 'Your Name', // Replace with your actual name
  bloodGroup: BloodGroup.O_POSITIVE,
  location: 'Dhaka',
  phone: '+8801234567890', // Replace with your phone number
  profilePic: 'https://placehold.co/100x100',
  lastDonation: '2025-08-15',
};

const initialDonationHistory: Donation[] = [
  { id: '1', date: '2025-08-15', location: 'Dhaka' },
  { id: '2', date: '2025-05-10', location: 'Dhaka' },
  { id: '3', date: '2025-02-20', location: 'Dhaka' },
];

const initialState: ProfileState = {
  profile: initialProfile,
  donationHistory: initialDonationHistory,
  loading: false,
  error: null,
  editModalVisible: false,
  editedProfile: initialProfile,
  currentPage: 1,
};

const profileReducer = (state: ProfileState, action: ProfileAction): ProfileState => {
  switch (action.type) {
    case 'SET_PROFILE':
      return { ...state, profile: action.payload };
    case 'SET_DONATION_HISTORY':
      return { ...state, donationHistory: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_EDIT_MODAL_VISIBLE':
      return { ...state, editModalVisible: action.payload };
    case 'SET_EDITED_PROFILE':
      return { ...state, editedProfile: action.payload };
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };
    case 'SAVE_PROFILE':
      return { ...state, profile: state.editedProfile, editModalVisible: false };
    default:
      return state;
  }
};

const Profile: React.FC = () => {
  const [fontsLoaded] = useFonts({ Roboto_400Regular, Roboto_700Bold });
  const [state, dispatch] = useReducer(profileReducer, initialState);
  const itemsPerPage = 3;

  // Simulate async data fetching
  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: true });
    setTimeout(() => {
      dispatch({ type: 'SET_PROFILE', payload: initialProfile });
      dispatch({ type: 'SET_DONATION_HISTORY', payload: initialDonationHistory });
      dispatch({ type: 'SET_LOADING', payload: false });
    }, 1000);
  }, []);

  const handleEditProfile = () => {
    dispatch({ type: 'SET_EDIT_MODAL_VISIBLE', payload: true });
    dispatch({ type: 'SET_EDITED_PROFILE', payload: state.profile });
  };

  const handleSaveProfile = () => {
    if (!state.editedProfile.name.trim() || !state.editedProfile.bloodGroup || !state.editedProfile.location) {
      dispatch({ type: 'SET_ERROR', payload: 'All fields are required.' });
      return;
    }
    dispatch({ type: 'SAVE_PROFILE' });
    AccessibilityInfo.announceForAccessibility('Profile updated successfully');
  };

  const handleRequestDonation = () => {
    // Placeholder for donation request logic
    AccessibilityInfo.announceForAccessibility('Donation request sent');
  };

  const handleCall = () => {
    // Placeholder for call logic (e.g., Linking.openURL(`tel:${state.profile.phone}`))
    if (state.profile.phone) {
      AccessibilityInfo.announceForAccessibility(`Calling ${state.profile.phone}`);
    } else {
      AccessibilityInfo.announceForAccessibility('No phone number available');
    }
  };

  const handleFlower = () => {
    // Placeholder for flower action (e.g., send appreciation)
    AccessibilityInfo.announceForAccessibility('Flower sent to Your Name');
  };

  // Pagination logic
  const totalPages = Math.ceil(state.donationHistory.length / itemsPerPage);
  const startIndex = (state.currentPage - 1) * itemsPerPage;
  const paginatedHistory = state.donationHistory.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    dispatch({ type: 'SET_PAGE', payload: page });
    AccessibilityInfo.announceForAccessibility(`Navigated to page ${page}`);
  };

  // Check donor availability (e.g., 3 months since last donation)
  const isAvailable = () => {
    if (!state.profile.lastDonation) return true;
    const lastDonationDate = new Date(state.profile.lastDonation);
    const currentDate = new Date('2025-09-07T22:06:00+06:00'); // Updated to current date and time
    const monthsDiff = (currentDate.getTime() - lastDonationDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return monthsDiff >= 3;
  };

  if (!fontsLoaded || state.loading) {
    return (
      <View style={styles.loading}>
        <View style={styles.skeletonAvatar} />
        <View style={[styles.skeletonText, { width: '60%', marginBottom: 8 }]} />
        <View style={[styles.skeletonText, { width: '40%' }]} />
        <View style={[styles.skeletonText, { width: '40%' }]} />
        <View style={[styles.skeletonText, { width: '50%', marginTop: 16 }]} />
        {Array(2)
          .fill(0)
          .map((_, index) => (
            <View key={index} style={styles.skeletonHistoryItem}>
              <View style={styles.skeletonIcon} />
              <View style={[styles.skeletonText, { width: '50%' }]} />
            </View>
          ))}
      </View>
    );
  }

  return (
    <LinearGradient colors={['#fff', '#ffebee']} style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Donor Profile</Text>
          <Text style={styles.headerSubtitle}>Manage your blood donation profile</Text>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Image
            source={{ uri: state.profile.profilePic || 'https://placehold.co/100x100' }}
            style={styles.avatar}
            accessibilityLabel={`${state.profile.name}'s profile picture`}
          />
          <Text style={styles.name}>{state.profile.name}</Text>
          <Text style={styles.bloodGroup}>Blood Group: {state.profile.bloodGroup}</Text>
          <Text style={styles.location}>Location: {state.profile.location}</Text>
          <Text style={styles.phone}>Phone: {state.profile.phone || 'Not provided'}</Text>
          <View style={[styles.availabilityBadge, isAvailable() ? styles.available : styles.unavailable]}>
            <Text style={styles.availabilityText}>
              {isAvailable() ? 'Available to Donate' : 'Not Available'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.callButton}
            onPress={handleCall}
            accessibilityLabel="Call donor"
            disabled={!state.profile.phone}
          >
            <Ionicons name="call" size={20} color="#fff" />
            <Text style={styles.buttonText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.flowerButton}
            onPress={handleFlower}
            accessibilityLabel="Send flower"
          >
            <Ionicons name="flower" size={20} color="#fff" />
            <Text style={styles.buttonText}>Flower</Text>
          </TouchableOpacity>
        </View>

        {/* Compatibility Section */}
        <View style={styles.compatibilitySection}>
          <Text style={styles.sectionTitle}>Compatible Blood Types</Text>
          <Text style={styles.compatibilityText}>
            {compatibility[state.profile.bloodGroup].join(', ') || 'None'}
          </Text>
        </View>

        {/* Donation History */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Donation History</Text>
          <FlatList
            data={paginatedHistory}
            renderItem={({ item }) => (
              <View style={styles.historyItem}>
                <Ionicons name="calendar-outline" size={20} color="#d32f2f" />
                <Text style={styles.historyText}>
                  Donated on {item.date} at {item.location}
                </Text>
              </View>
            )}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <Text style={styles.noHistory}>No donation history available</Text>
            }
          />
          {totalPages > 1 && (
            <View style={styles.paginationContainer}>
              <TouchableOpacity
                style={[styles.paginationButton, state.currentPage === 1 && styles.disabledButton]}
                onPress={() => handlePageChange(state.currentPage - 1)}
                disabled={state.currentPage === 1}
                accessibilityLabel="Previous page"
              >
                <Text style={styles.paginationText}>Previous</Text>
              </TouchableOpacity>
              <View style={styles.pageNumbers}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <TouchableOpacity
                    key={page}
                    style={[
                      styles.pageNumberButton,
                      state.currentPage === page && styles.activePageButton,
                    ]}
                    onPress={() => handlePageChange(page)}
                    accessibilityLabel={`Page ${page}`}
                  >
                    <Text
                      style={[
                        styles.pageNumberText,
                        state.currentPage === page && styles.activePageNumberText,
                      ]}
                    >
                      {page}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  state.currentPage === totalPages && styles.disabledButton,
                ]}
                onPress={() => handlePageChange(state.currentPage + 1)}
                disabled={state.currentPage === totalPages}
                accessibilityLabel="Next page"
              >
                <Text style={styles.paginationText}>Next</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditProfile}
            accessibilityLabel="Edit profile"
          >
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.requestButton, !isAvailable() && styles.disabledButton]}
            onPress={handleRequestDonation}
            disabled={!isAvailable()}
            accessibilityLabel="Request donation"
          >
            <Text style={styles.buttonText}>Request Donation</Text>
          </TouchableOpacity>
          
        </View>

        {/* Error Message */}
        {state.error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={40} color="#d32f2f" />
            <Text style={styles.errorText}>{state.error}</Text>
          </View>
        )}

        {/* Edit Profile Modal */}
        <Modal
          visible={state.editModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => dispatch({ type: 'SET_EDIT_MODAL_VISIBLE', payload: false })}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TextInput
                style={styles.input}
                value={state.editedProfile.name}
                onChangeText={(text) =>
                  dispatch({
                    type: 'SET_EDITED_PROFILE',
                    payload: { ...state.editedProfile, name: text },
                  })
                }
                placeholder="Name"
                accessibilityLabel="Edit name"
              />
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={state.editedProfile.bloodGroup}
                  style={styles.pickerInput}
                  onValueChange={(itemValue) =>
                    dispatch({
                      type: 'SET_EDITED_PROFILE',
                      payload: { ...state.editedProfile, bloodGroup: itemValue as BloodGroup },
                    })
                  }
                  accessibilityLabel="Select blood group"
                >
                  {bloodGroups.map((group) => (
                    <Picker.Item key={group} label={group} value={group} />
                  ))}
                </Picker>
              </View>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={state.editedProfile.location}
                  style={styles.pickerInput}
                  onValueChange={(itemValue) =>
                    dispatch({
                      type: 'SET_EDITED_PROFILE',
                      payload: { ...state.editedProfile, location: itemValue as string },
                    })
                  }
                  accessibilityLabel="Select location"
                >
                  {locations.map((loc) => (
                    <Picker.Item key={loc} label={loc} value={loc} />
                  ))}
                </Picker>
              </View>
              <TextInput
                style={styles.input}
                value={state.editedProfile.phone}
                onChangeText={(text) =>
                  dispatch({
                    type: 'SET_EDITED_PROFILE',
                    payload: { ...state.editedProfile, phone: text },
                  })
                }
                placeholder="Phone Number"
                keyboardType="phone-pad"
                accessibilityLabel="Edit phone number"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => dispatch({ type: 'SET_EDIT_MODAL_VISIBLE', payload: false })}
                  accessibilityLabel="Cancel edit"
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleSaveProfile}
                  accessibilityLabel="Save profile"
                >
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Dimensions.get('window').width * 0.04,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeletonAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eee',
    marginBottom: 10,
  },
  skeletonText: {
    height: 20,
    backgroundColor: '#eee',
    borderRadius: 4,
  },
  skeletonHistoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  skeletonIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#eee',
    marginRight: 10,
  },
  header: {
    padding: 0,
    backgroundColor: '#d32f2f',
    borderRadius: 12,
    marginBottom: 16,
  },
  headerTitle: {
    fontFamily: 'Roboto_700Bold',
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 8,
  },
  profileSection: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    backgroundColor: '#eee',
  },
  name: {
    fontFamily: 'Roboto_700Bold',
    fontSize: 24,
    color: '#333',
    marginBottom: 8,
  },
  bloodGroup: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 18,
    color: '#d32f2f',
    marginBottom: 8,
  },
  location: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  phone: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  availabilityBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  available: {
    backgroundColor: '#388e3c',
  },
  unavailable: {
    backgroundColor: '#d32f2f',
  },
  availabilityText: {
    fontFamily: 'Roboto_700Bold',
    fontSize: 14,
    color: '#fff',
  },
  compatibilitySection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Roboto_700Bold',
    fontSize: 18,
    color: '#d32f2f',
    marginBottom: 8,
  },
  compatibilityText: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    color: '#333',
  },
  historySection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    marginBottom: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyText: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  noHistory: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
    flexWrap: 'wrap', // Allow wrapping if screen is narrow
  },
  editButton: {
    backgroundColor: '#d32f2f',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    minWidth: 100,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  requestButton: {
    backgroundColor: '#388e3c',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    minWidth: 100,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  callButton: {
    backgroundColor: '#2e7d32', // Darker green for call
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    minWidth: 100,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  flowerButton: {
    backgroundColor: '#f9a825', // Yellow for flower
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    minWidth: 100,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: 'Roboto_700Bold',
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginLeft: 8, // Space between icon and text
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffebee',
    borderRadius: 12,
    margin: 16,
  },
  errorText: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    color: '#d32f2f',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontFamily: 'Roboto_700Bold',
    fontSize: 20,
    color: '#d32f2f',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  pickerContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  pickerInput: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    backgroundColor: '#d32f2f',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginTop: 12,
  },
  pageNumbers: {
    flexDirection: 'row',
    gap: 8,
  },
  paginationButton: {
    backgroundColor: '#d32f2f',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 2,
  },
  pageNumberButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 2,
  },
  activePageButton: {
    backgroundColor: '#d32f2f',
  },
  paginationText: {
    color: '#fff',
    fontFamily: 'Roboto_700Bold',
    fontSize: 14,
  },
  pageNumberText: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    color: '#333',
  },
  activePageNumberText: {
    color: '#fff',
    fontFamily: 'Roboto_700Bold',
  },
});

export default Profile;