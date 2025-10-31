import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList, Image, Switch, TextInput, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Roboto_400Regular, Roboto_700Bold } from '@expo-google-fonts/roboto';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';

const shariatpurThanas = [
  "Shariatpur Sadar",
  "Zajira",
  "Naria",
  "Sokhipur",
  "Gosairhat",
  "Padma Bridge South",
  "Damudya",
  "Bhedargonj"
];

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const compatibility = {
  'A+': ['A+', 'AB+'],
  'A-': ['A+', 'A-', 'AB+', 'AB-'],
  'B+': ['B+', 'AB+'],
  'B-': ['B+', 'B-', 'AB+', 'AB-'],
  'AB+': ['AB+'],
  'AB-': ['AB+', 'AB-'],
  'O+': ['A+', 'B+', 'AB+', 'O+'],
  'O-': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
};

const recentViews = [
  { id: '1', title: 'Emergency B+ Blood Needed', location: 'Hospital Name', date: '12 Feb 2022' },
  { id: '2', title: 'Emergency A+ Blood Needed', location: 'Hospital Name', date: '10 Feb 2022' },
];

const contributions = [
  { title: '1k+', subtitle: 'Blood Donor' },
  { title: '20', subtitle: 'Post everyday' },
  { title: '20', subtitle: 'Post yesterday' },
];

const mockData = [
  { id: '1', title: 'John Doe', bloodGroup: 'A+', location: 'Dhaka' },
  { id: '2', title: 'Jane Smith', bloodGroup: 'O+', location: 'Chittagong' },
  { id: '3', title: 'Rahim Khan', bloodGroup: 'B+', location: 'Sylhet' },
  { id: '4', title: 'Ibrahim Khan', bloodGroup: 'AB-', location: 'Rajshahi' },
  { id: '5', title: 'Nusrat Jahan', bloodGroup: 'A-', location: 'Barisal' },
  { id: '6', title: 'Kamal Uddin', bloodGroup: 'O-', location: 'Rangpur' },
  { id: '7', title: 'Shila Akter', bloodGroup: 'B-', location: 'Khulna' },
  { id: '8', title: 'Mehedi Hasan', bloodGroup: 'AB+', location: 'Mymensingh' },
  { id: '9', title: 'Tania Rahman', bloodGroup: 'A+', location: 'Dhaka' },
  { id: '10', title: 'Faruk Ahmed', bloodGroup: 'O+', location: 'Chittagong' },
  { id: '11', title: 'Samira Islam', bloodGroup: 'B+', location: 'Sylhet' },
  { id: '12', title: 'Rafiq Hossain', bloodGroup: 'AB-', location: 'Rajshahi' },
  { id: '13', title: 'Sadia Karim', bloodGroup: 'A-', location: 'Barisal' },
  { id: '14', title: 'Mahmudul Alam', bloodGroup: 'O-', location: 'Rangpur' },
  { id: '15', title: 'Parvin Sultana', bloodGroup: 'B-', location: 'Khulna' },
  { id: '16', title: 'Arif Chowdhury', bloodGroup: 'AB+', location: 'Mymensingh' },
  { id: '17', title: 'Lamia Akter', bloodGroup: 'A+', location: 'Dhaka' },
  { id: '18', title: 'Sajid Hossain', bloodGroup: 'O+', location: 'Chittagong' },
  { id: '19', title: 'Nabila Noor', bloodGroup: 'B+', location: 'Sylhet' },
  { id: '20', title: 'Tanvir Hasan', bloodGroup: 'AB-', location: 'Rajshahi' },
];

const Home: React.FC = () => {
  const [fontsLoaded] = useFonts({ Roboto_400Regular, Roboto_700Bold });
  const [isDonor, setIsDonor] = React.useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string | undefined>(undefined);
  const [selectedThana, setSelectedThana] = useState<string | undefined>(undefined);
  const [filteredData, setFilteredData] = useState(mockData);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const handleSearch = useCallback(() => {
    let filtered = [...mockData];

    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedBloodGroup) {
      filtered = filtered.filter(item => item.bloodGroup === selectedBloodGroup);
    }
    if (selectedThana) {
      filtered = filtered.filter(item => item.location === selectedThana);
    }

    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page on new search
  }, [searchQuery, selectedBloodGroup, selectedThana]);

  const handleAutoSuggest = useCallback((text: string) => {
    setSearchQuery(text);
    handleSearch();
  }, [handleSearch]);

  const handleClear = () => {
    setSearchQuery('');
    setSelectedBloodGroup(undefined);
    setSelectedThana(undefined);
    setFilteredData(mockData);
    setCurrentPage(1);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (!fontsLoaded) return <View style={styles.loading}><Text>Loading...</Text></View>;

  return (
    <LinearGradient colors={['#fff', '#ffebee']} style={styles.container}>
      <ScrollView>
        {/* Profile Header */}
        <View style={styles.header}>
          <ImageBackground
            source={require('./assets/7127260.jpg')}
            style={styles.banner}
            imageStyle={{ borderRadius: 0 }}
          >
            <View style={styles.overlay}>
            </View>
          </ImageBackground>
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.input}
              placeholder="Search by name or location"
              value={searchQuery}
              onChangeText={handleAutoSuggest}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                <Ionicons name="close" size={20} color="#d32f2f" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
              <Ionicons name="search" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.pickersRow}>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedBloodGroup}
                style={styles.pickerInput}
                onValueChange={(itemValue) => setSelectedBloodGroup(itemValue as string)}
              >
                <Picker.Item label="Select Blood Group" value={undefined} style={{ fontSize: 13 }} />
                {bloodGroups.map((group) => (
                  <Picker.Item key={group} label={group} style={{ fontSize: 13 }} value={group} />
                ))}
              </Picker>
            </View>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedThana}
                style={styles.pickerInput}
                onValueChange={(itemValue) => setSelectedThana(itemValue as string)}
              >
                <Picker.Item label="Select Thana" value={undefined} style={{ fontSize: 13 }} />
                {shariatpurThanas.map((thana) => (
                  <Picker.Item style={{ fontSize: 13 }} key={thana} label={thana} value={thana} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        {/* Search Results */}
        {filteredData.length > 0 && (
          <>
            <FlatList
              data={paginatedData}
              renderItem={({ item }) => (
                <View style={styles.searchResultCard}>
                  <Image
                    source={
                      item.profilePic
                        ? { uri: item.profilePic }
                        : require('./assets/dummy-profile.png')
                    }
                    style={styles.profilePic}
                  />
                  <View style={styles.infoContainer}>
                    <Text style={styles.infoText}>Name: {item.title || '—'}</Text>
                    <Text style={styles.infoText}>Address: {item.location || '—'}</Text>
                    <Text style={styles.infoText}>Blood Group: {item.bloodGroup || '—'}</Text>
                    <Text style={styles.infoText}>Phone: {item.phone || '—'}</Text>
                  </View>
                </View>
              )}
              keyExtractor={(item) => item.id.toString()}
              style={styles.searchResults}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'flex-start' }}
            />
            {/* Pagination Controls */}
            <View style={styles.paginationContainer}>
              <TouchableOpacity
                style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]}
                onPress={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <Text style={styles.paginationText}>Previous</Text>
              </TouchableOpacity>
              <Text style={styles.pageNumber}>
                Page {currentPage} of {totalPages}
              </Text>
              <TouchableOpacity
                style={[styles.paginationButton, currentPage === totalPages && styles.disabledButton]}
                onPress={handleNextPage}
                disabled={currentPage === totalPages}
              >
                <Text style={styles.paginationText}>Next</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(136, 8, 8, 0.8)',
    marginTop: 30,
  },
  banner: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  userName: { fontFamily: 'Roboto_700Bold', fontSize: 18, paddingTop: 5, color: '#ffffff' },
  switchContainer: { flexDirection: 'column', alignItems: 'flex-start', paddingTop: 10 },
  switchText: { fontFamily: 'Roboto_400Regular', marginRight: 10, color: '#ffffff' },
  icons: { flexDirection: 'row', marginLeft: 'auto', gap: 15 },
  searchSection: { margin: 10 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
  },
  input: {
    flex: 1,
    padding: 10,
    fontFamily: 'Roboto_400Regular',
    fontSize: 13,
    color: '#333',
  },
  clearButton: { padding: 8, marginRight: 8 },
  searchButton: {
    backgroundColor: '#d32f2f',
    padding: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: -5,
    gap: 10,
  },
  pickerWrapper: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  pickerInput: {
    flex: 1,
    color: '#333',
    fontSize: 13,
  },
  searchResults: { margin: 5, paddingLeft: 2, paddingRight: 2 },
  searchResultCard: {
    flexBasis: '47%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    margin: 5,
    elevation: 2,
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
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
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 10,
    marginBottom: 20,
  },
  paginationButton: {
    backgroundColor: '#d32f2f',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
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
  pageNumber: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    color: '#333',
  },
});

export default Home;