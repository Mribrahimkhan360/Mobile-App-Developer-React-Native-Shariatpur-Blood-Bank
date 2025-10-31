import React, { useState, useCallback, useReducer, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  ImageBackground,
  RefreshControl,
  Dimensions,
  AccessibilityInfo,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Roboto_400Regular, Roboto_700Bold } from '@expo-google-fonts/roboto';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import { debounce } from 'lodash';

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

interface EmergencyDonor {
  id: string;
  name: string;
  bloodGroup: BloodGroup;
  location: string;
  phone?: string;
  urgencyLevel: 'low' | 'medium' | 'high';
  lastDonation?: string;
  profilePic?: string;
}

interface SearchState {
  searchQuery: string;
  selectedBloodGroup: BloodGroup | undefined;
  selectedThana: string | undefined;
  filteredData: EmergencyDonor[];
  currentPage: number;
  loading: boolean;
  error: string | null;
}

type SearchAction =
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_BLOOD_GROUP'; payload: BloodGroup | undefined }
  | { type: 'SET_THANA'; payload: string | undefined }
  | { type: 'SET_FILTERED_DATA'; payload: EmergencyDonor[] }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };

const shariatpurThanas = [
  'Shariatpur Sadar',
  'Zajira',
  'Naria',
  'Sokhipur',
  'Gosairhat',
  'Padma Bridge South',
  'Damudya',
  'Bhedargonj',
];

const bloodGroups = Object.values(BloodGroup);

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

const mockData: EmergencyDonor[] = [
  {
    id: '1',
    name: 'John Doe',
    bloodGroup: BloodGroup.A_POSITIVE,
    location: 'Shariatpur Sadar',
    phone: '+8801234567890',
    urgencyLevel: 'high',
    lastDonation: '2025-08-01',
  },
  {
    id: '2',
    name: 'Jane Smith',
    bloodGroup: BloodGroup.O_POSITIVE,
    location: 'Zajira',
    phone: '+8801234567891',
    urgencyLevel: 'medium',
    lastDonation: '2025-07-15',
  },
  {
    id: '3',
    name: 'Rahim Khan',
    bloodGroup: BloodGroup.B_POSITIVE,
    location: 'Naria',
    phone: '+8801234567892',
    urgencyLevel: 'low',
    lastDonation: '2025-06-20',
  },
  {
    id: '4',
    name: 'Ibrahim Khan',
    bloodGroup: BloodGroup.AB_NEGATIVE,
    location: 'Sokhipur',
    phone: '+8801234567893',
    urgencyLevel: 'high',
    lastDonation: '2025-09-01',
  },
  {
    id: '5',
    name: 'Nusrat Jahan',
    bloodGroup: BloodGroup.A_NEGATIVE,
    location: 'Gosairhat',
    phone: '+8801234567894',
    urgencyLevel: 'medium',
    lastDonation: '2025-08-10',
  },
  {
    id: '6',
    name: 'Kamal Uddin',
    bloodGroup: BloodGroup.O_NEGATIVE,
    location: 'Padma Bridge South',
    phone: '+8801234567895',
    urgencyLevel: 'high',
    lastDonation: '2025-07-30',
  },
  {
    id: '7',
    name: 'Shila Akter',
    bloodGroup: BloodGroup.B_NEGATIVE,
    location: 'Damudya',
    phone: '+8801234567896',
    urgencyLevel: 'low',
    lastDonation: '2025-06-15',
  },
  {
    id: '8',
    name: 'Mehedi Hasan',
    bloodGroup: BloodGroup.AB_POSITIVE,
    location: 'Bhedargonj',
    phone: '+8801234567897',
    urgencyLevel: 'medium',
    lastDonation: '2025-08-20',
  },
];

const initialState: SearchState = {
  searchQuery: '',
  selectedBloodGroup: undefined,
  selectedThana: undefined,
  filteredData: mockData,
  currentPage: 1,
  loading: false,
  error: null,
};

const searchReducer = (state: SearchState, action: SearchAction): SearchState => {
  switch (action.type) {
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_BLOOD_GROUP':
      return { ...state, selectedBloodGroup: action.payload };
    case 'SET_THANA':
      return { ...state, selectedThana: action.payload };
    case 'SET_FILTERED_DATA':
      return { ...state, filteredData: action.payload };
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET':
      return { ...initialState, filteredData: mockData };
    default:
      return state;
  }
};

// Custom debounce hook
const useDebounce = (callback: (...args: any[]) => void, delay: number) => {
  return useCallback(debounce(callback, delay), [callback, delay]);
};

const EmergencyDonors: React.FC = () => {
  const [fontsLoaded] = useFonts({ Roboto_400Regular, Roboto_700Bold });
  const [state, dispatch] = useReducer(searchReducer, initialState);
  const itemsPerPage = 6;

  const debouncedSearch = useDebounce(() => {
    dispatch({ type: 'SET_LOADING', payload: true });
    let filtered = [...mockData];

    if (state.searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(state.searchQuery.toLowerCase())
      );
    }
    if (state.selectedBloodGroup) {
      filtered = filtered.filter(item => {
        if (state.selectedBloodGroup) {
          return compatibility[state.selectedBloodGroup].includes(item.bloodGroup);
        }
        return true;
      });
    }
    if (state.selectedThana) {
      filtered = filtered.filter(item => item.location === state.selectedThana);
    }

    if (filtered.length === 0) {
      dispatch({ type: 'SET_ERROR', payload: 'No emergency donors found.' });
    } else {
      dispatch({ type: 'SET_ERROR', payload: null });
    }

    dispatch({ type: 'SET_FILTERED_DATA', payload: filtered });
    dispatch({ type: 'SET_PAGE', payload: 1 });
    dispatch({ type: 'SET_LOADING', payload: false });
  }, 300);

  const handleSearch = useCallback(() => {
    debouncedSearch();
  }, [debouncedSearch]);

  const handleAutoSuggest = useCallback((text: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: text });
    handleSearch();
  }, [handleSearch]);

  const handleClear = () => {
    dispatch({ type: 'RESET' });
  };

  const onRefresh = useCallback(() => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'RESET' });
    setTimeout(() => dispatch({ type: 'SET_LOADING', payload: false }), 500);
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(state.filteredData.length / itemsPerPage);
  const startIndex = (state.currentPage - 1) * itemsPerPage;
  const paginatedData = state.filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    dispatch({ type: 'SET_PAGE', payload: page });
    AccessibilityInfo.announceForAccessibility(`Navigated to page ${page}`);
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Skeleton loader component
  const SkeletonDonorCard = () => (
    <View style={[styles.searchResultCard, styles.skeletonCard]}>
      <View style={styles.skeletonProfilePic} />
      <View style={styles.infoContainer}>
        <View style={styles.skeletonText} />
        <View style={[styles.skeletonText, styles.skeletonSmall]} />
        <View style={[styles.skeletonText, styles.skeletonSmall]} />
        <View style={[styles.skeletonText, styles.skeletonSmall]} />
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#fff', '#ffebee']} style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={state.loading}
            onRefresh={onRefresh}
            colors={['#d32f2f']}
            accessibilityLabel="Refresh emergency donors"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <ImageBackground
            source={require('./assets/7127260.jpg')}
            style={styles.banner}
            imageStyle={{ borderRadius: 0 }}
          >
            <View style={styles.overlay}>
              <Text style={styles.headerTitle}></Text>
              <Text style={styles.headerSubtitle}></Text>
            </View>
          </ImageBackground>
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.input}
              placeholder="Search by name or location"
              value={state.searchQuery}
              onChangeText={handleAutoSuggest}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              accessibilityLabel="Search emergency donors"
              accessibilityHint="Enter name or location to find donors"
            />
            {state.searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={handleClear}
                style={styles.clearButton}
                accessibilityLabel="Clear search"
              >
                <Ionicons name="close" size={20} color="#d32f2f" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleSearch}
              style={styles.searchButton}
              accessibilityLabel="Search"
            >
              <Ionicons name="search" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.pickersRow}>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={state.selectedBloodGroup}
                style={styles.pickerInput}
                onValueChange={(itemValue) => {
                  dispatch({ type: 'SET_BLOOD_GROUP', payload: itemValue as BloodGroup });
                  handleSearch();
                }}
                accessibilityLabel="Select blood group"
              >
                <Picker.Item label="Select Blood Group" value={undefined} style={{ fontSize: 13 }} />
                {bloodGroups.map((group) => (
                  <Picker.Item key={group} label={group} style={{ fontSize: 13 }} value={group} />
                ))}
              </Picker>
            </View>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={state.selectedThana}
                style={styles.pickerInput}
                onValueChange={(itemValue) => {
                  dispatch({ type: 'SET_THANA', payload: itemValue as string });
                  handleSearch();
                }}
                accessibilityLabel="Select thana"
              >
                <Picker.Item label="Select Thana" value={undefined} style={{ fontSize: 13 }} />
                {shariatpurThanas.map((thana) => (
                  <Picker.Item style={{ fontSize: 13 }} key={thana} label={thana} value={thana} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        {/* Compatible Blood Types */}
        {state.selectedBloodGroup && (
          <View style={styles.compatibilitySection}>
            <Text style={styles.sectionTitle}>
              Compatible Blood Types for {state.selectedBloodGroup}
            </Text>
            <Text style={styles.compatibilityText}>
              {compatibility[state.selectedBloodGroup].join(', ') || 'None'}
            </Text>
          </View>
        )}

        {/* Error Message */}
        {state.error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={40} color="#d32f2f" />
            <Text style={styles.errorText}>{state.error}</Text>
          </View>
        )}

        {/* Search Results */}
        <FlatList
          data={state.loading ? Array(itemsPerPage).fill({}) : paginatedData}
          renderItem={({ item, index }) =>
            state.loading ? (
              <SkeletonDonorCard key={index} />
            ) : (
              <View style={styles.searchResultCard}>
                <Image
                  source={
                    item.profilePic
                      ? { uri: item.profilePic }
                      : require('./assets/dummy-profile.png')
                  }
                  style={styles.profilePic}
                  accessibilityLabel={`${item.name}'s profile picture`}
                />
                {item.urgencyLevel === 'high' && (
                  <View style={styles.urgentBadge}>
                    <Text style={styles.urgentBadgeText}>Urgent</Text>
                  </View>
                )}
                <View style={styles.infoContainer}>
                  <View style={styles.nameContainer}>
                    <Text style={styles.infoText}>Name: {item.name || '—'}</Text>
                
                  </View>
                  <Text style={styles.infoText}>Address: {item.location || '—'}</Text>
                  <Text style={styles.infoText}>Blood Group: {item.bloodGroup || '—'}</Text>
                  <Text style={styles.infoText}>Phone: {item.phone || '—'}</Text>
                  <Text style={styles.infoText}>
                    Last Donation: {item.lastDonation || 'Unknown'}
                  </Text>
                  <TouchableOpacity style={styles.contactButton} accessibilityLabel={`Contact ${item.name}`}>
                    <Text style={styles.contactButtonText}>Contact Now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )
          }
          keyExtractor={(item, index) => (state.loading ? `skeleton-${index}` : item.id)}
          style={styles.searchResults}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'flex-start' }}
          ListEmptyComponent={
            !state.loading && (
              <View style={styles.emptyContainer}>
                <Ionicons name="alert-circle-outline" size={40} color="#d32f2f" />
                <Text style={styles.noResult}>No emergency donors found</Text>
              </View>
            )
          }
        />

        {/* Pagination Controls */}
        {paginatedData.length > 0 && !state.loading && (
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
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // padding: Dimensions.get('window').width * 0.04,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    color: '#333',
  },
  header: {
    marginTop: 30,
  },
  banner: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  searchSection: {
    margin: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    flex: 1,
    padding: 12,
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    color: '#333',
  },
  clearButton: {
    padding: 8,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: '#d32f2f',
    padding: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  pickerWrapper: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    overflow: 'hidden',
  },
  pickerInput: {
    flex: 1,
    color: '#333',
    fontSize: 13,
  },
  compatibilitySection: {
    margin: 2,
    padding: 2,
    backgroundColor: '#48a803ff',
    borderRadius: 12,
    elevation: 3,
  },
  sectionTitle: {
    fontFamily: 'Roboto_700Bold',
    fontSize: 16,
    color: '#d32f2f',
    marginBottom: 8,
  },
  compatibilityText: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    color: '#333',
  },
  searchResults: {
    margin: 5,
    paddingHorizontal: 2,
  },
  searchResultCard: {
    flexBasis: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    margin: 5,
    elevation: 3,
    minHeight: 230,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  skeletonCard: {
    opacity: 0.5,
  },
  skeletonProfilePic: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#eee',
    marginBottom: 10,
  },
  skeletonText: {
    width: '80%',
    height: 16,
    backgroundColor: '#eee',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonSmall: {
    width: '60%',
    height: 12,
  },
  profilePic: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 10,
    backgroundColor: '#eee',
  },
  infoContainer: {
    width: '100%',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
    fontFamily: 'Roboto_400Regular',
  },
  urgentBadge: {
    backgroundColor: '#d32f2f',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  urgentBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Roboto_700Bold',
  },
  contactButton: {
    backgroundColor: '#d32f2f',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    alignSelf: 'center',
  },
  contactButtonText: {
    color: '#fff',
    fontFamily: 'Roboto_700Bold',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noResult: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffebee',
    borderRadius: 12,
    margin: 12,
  },
  errorText: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    color: '#d32f2f',
    marginTop: 10,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 10,
    marginBottom: 20,
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
  disabledButton: {
    backgroundColor: '#ccc',
  },
  paginationText: {
    color: '#fff',
    fontFamily: 'Roboto_700Bold',
    fontSize: 14,
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

export default EmergencyDonors;