import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import PageContainer from '../../components/PageContainer';
import PageTitle from '../../components/PageTitle';
import { COLORS } from '../../constants';
import DatePicker from 'react-native-date-picker';
import { RootState } from '../../redux/store';

const CreateMaroopScreen = () => {
  const [maroopName, setMaroopName] = useState('');
  const [open, setOpen] = useState(false)
  const [startDate, setStartDate] = useState(new Date());

  const navigation = useNavigation();
  const firmId = useSelector((state: RootState) => state.headerSlice.firmData.firm_id)

  const handleSubmit = async () => {
    const formData = {
      name: maroopName,
      start_date: startDate.toISOString().split('T')[0]
    };

    const token = await AsyncStorage.getItem('token');
    if (!token) {
      throw new Error('Token not found');
    }

    const headers = { Authorization: `${token}` };
    console.log('formData: ', formData);

    const response = await axios.post(`${API_URL}/firms/${firmId}/maroops/`, formData, { headers });

    if (response.status === 200) {
      navigation.navigate('Maroops');
      console.log('Firm was created successfully');
      setMaroopName("")
    } else {
      navigation.navigate('Maroops');
      setMaroopName("")
      throw new Error('Failed to create firm');
    }
  };

  return (
    <PageContainer style={styles.container}>
      <PageTitle text="Create A Maroop" />
      <ScrollView contentContainerStyle={styles.formContainer}>
        <View style={{ width: '100%' }}>
          <TextInput
            style={styles.input}
            placeholder="Name of the Maroop"
            value={maroopName}
            onChangeText={setMaroopName}
          />

          <View style={styles.DatePayment}>
            <TouchableOpacity style={styles.button} onPress={() => setOpen(true)}>
              <Text style={[styles.buttonText, { fontWeight: '400' }]}>Pick a New Start Date</Text>
            </TouchableOpacity>
            <DatePicker
              modal
              open={open}
              date={startDate}
              onConfirm={(date) => {
                setOpen(false);
                setStartDate(date);
              }}
              onCancel={() => {
                setOpen(false);
              }}
            />
          </View>

          <View style={styles.itemContainer}>
            <Text style={styles.item}>startDate: </Text>
            <Text style={styles.item}>
              {new Date(startDate).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>

          <TouchableOpacity style={[styles.button, { marginTop: 20 }]} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Create Maroop</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderColor: COLORS.tungfamGrey,
    backgroundColor: 'rgba(52, 152, 210, 0.1)',
  },
  formContainer: {
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.tungfamGrey,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  button: {
    backgroundColor: COLORS.tungfamBgColor,
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  DatePayment: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    marginBottom: 10
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: COLORS.tungfamGrey,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  item: {
    color: COLORS.black,
    fontSize: 16,
    paddingVertical: 4,
  },
});

export default CreateMaroopScreen;
