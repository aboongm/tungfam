import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Button, Alert, Pressable } from 'react-native';

import PageTitle from '../../components/PageTitle';
import PageContainer from '../../components/PageContainer';
import { COLORS } from '../../constants';
import { Picker } from '@react-native-picker/picker';
import DatePicker from 'react-native-date-picker'

const PaymentScheduleScreen = ({ route }) => {

    const { loan } = route.params;
    const loanList = [{
        installment: 'Choose',
    }];
    loanList.push(loan)
    // console.log(loanList);


    const [date, setDate] = useState(new Date())
    const [open, setOpen] = useState(false)

    const [newPaymentDate, setNewPaymentDate] = useState(new Date());
    const [selectedPayment, setSelectedPayment] = useState('');
    const [remark, setRemark] = useState('');
    const [payments, setPayments] = useState([]);
   
    const fetchPayments = async () => {
        try {
            const token = await AsyncStorage.getItem("token")
            const headers = {
                Authorization: `${token}`
            }

            const response = await axios.get(`${API_URL}/loans/:loanId/paymentschedules`, { headers }); // Replace :loanId with the actual loan ID
            // console.log("fetchPayments: ", response.data)
            setPayments(response.data);
        } catch (error) {
            console.error('Error fetching payments:', error);
        }
    };

    
    const filteredPayments = payments.filter(item => item.loan_id === loan.loan_id)
    const paidAmount = (filteredPayments.length + 1) * loan.installment;
    const outStandingPayable = loan.total_payable - paidAmount;

    console.log("filteredPayments: ", filteredPayments[filteredPayments.length - 1]);
    
    const addPayment = async () => {
        try {
            const token = await AsyncStorage.getItem("token")
            const headers = {
                Authorization: `${token}`
            }

            const formData = {
                loan_id: loan.loan_id,
                loan_type: loan.loan_type,
                borrower_name: loan.borrower_name,
                no_of_payments: loan.no_of_payments,
                total_payable: loan.total_payable,
                paid_amount: paidAmount || 0,
                outstanding_payable: outStandingPayable || loan.total_payable,
                // date: newPaymentDate.toLocaleDateString(),
                date: newPaymentDate.toISOString().split('T')[0],
                installment: loan.installment,
                remarks: remark || 'No remarks provided'
            }

            console.log("formData: ", formData);
            

            const response = await axios.post(`${API_URL}/loans/${loan.loan_id}/paymentschedules`, formData, { headers })
            console.log("response.data: ", response.data);
            
            if (response.status === 200) {
                const updatedPayments = [...payments, response.data];
                setPayments(updatedPayments);

                setNewPaymentDate(new Date());
                setSelectedPayment('');
                setRemark('');
                Alert.alert("Successfully created payment!")
                console.log("Successfully created payment!")
            }

        } catch (error) {
            console.log('error: ', error);
            
            Alert.alert("Failed to create payment!")
        }
    };


    useEffect(() => {
        fetchPayments()
    }, []);
    
    const takePermission = () => {
        const date = new Date();
        const localizedDate = date.toLocaleString(); 

        Alert.alert(
            'Confirm Payment',
            `Are you sure you want to add this payment for ${localizedDate}?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'OK',
                    onPress: addPayment 
                }
            ]
        );
    }

    return (
        <PageContainer style={styles.container}>
            <PageTitle text="Payment Schedule" />
            <View style={styles.infoContainer}>
                <View style={styles.infoBlock}>
                    <Text style={styles.infoHeader}>{loan.borrower_name}</Text>
                    <Text style={styles.infoHeader}>{loan.loan_type}</Text>
                </View>
                <View style={styles.infoBlock}>
                    <View style={styles.blockContainer}>
                        <Text style={styles.infoText}>TotalPayable</Text>
                        <Text style={styles.infoText}>{loan.total_payable}</Text>
                    </View>
                    <View style={styles.blockContainer}>
                        <Text style={styles.infoText}>PaidAmount</Text>
                        <Text style={styles.infoText}>Rs {filteredPayments[filteredPayments.length - 1]?.paid_amount || 0}</Text>
                    </View>
                    <View style={styles.blockContainer}>
                        <Text style={styles.infoText}>OutsPayable</Text>
                        <Text style={styles.infoText}>Rs {filteredPayments[filteredPayments.length - 1]?.outstanding_payable || loan.total_payable} </Text>
                    </View>
                </View>
            </View>

            <View style={styles.tableRow}>
                <Text style={styles.columnHeader}>Date</Text>
                <Text style={styles.columnHeader}>Payment</Text>
                <Text style={styles.columnHeader}>Remarks</Text>
            </View>
            <ScrollView contentContainerStyle={styles.formContainer}>
                <View style={{ width: '100%' }}>
                    <View style={styles.tableContainer}>
                        <View>
                            {payments.filter(item => item.loan_id === loan.loan_id).map((payment, index) => (
                                <View style={[
                                    styles.tableBody,
                                    index % 2 === 0 ? styles.evenRow : styles.oddRow,
                                ]} key={index}>
                                    <Text style={styles.columnItem}>
                                        {new Date(payment.date).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </Text>
                                    <Text style={styles.columnItem}>Rs {payment.installment}</Text>
                                    <Text style={styles.columnItem}>{payment.remarks}</Text>
                                </View>
                            ))}
                        </View>

                        <Text style={styles.paymentHeader}>Add A Payment</Text>
                        <View style={styles.tableInput}>
                            <View style={styles.DatePayment}>
                                {/* <View style={styles.dateButton}>
                                    <Button color={COLORS.TungfamBgColor} title="Pick Date" onPress={() => setOpen(true)} />
                                </View> */}
                                <Pressable style={styles.dateButton} onPress={() => setOpen(true)}>
                                    <Text style={styles.button}>Pick Date</Text>
                                </Pressable>
                                <DatePicker
                                    modal
                                    open={open}
                                    date={newPaymentDate}
                                    onConfirm={(date) => {
                                        setOpen(false);
                                        setNewPaymentDate(date);
                                    }}
                                    onCancel={() => {
                                        setOpen(false);
                                    }}
                                />
                                <Picker
                                    style={styles.paymentPicker}
                                    selectedValue={selectedPayment}
                                    onValueChange={(itemValue) => setSelectedPayment(itemValue)}
                                >
                                    {loanList.map((type, index) => (
                                        <Picker.Item key={index} label={type.installment} value={type.installment} />
                                    ))}
                                    {/* <Picker.Item label={loan.installment} value={loan.installment} /> */}
                                </Picker>
                            </View>

                            <TextInput
                                style={styles.descriptionInput}
                                placeholder="Enter remarks"
                                value={remark}
                                onChangeText={(text) => setRemark(text)}
                            />
                            <TouchableOpacity onPress={takePermission}>
                                <Text style={styles.addPaymentButton}>Add Payment</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </PageContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderWidth: 1,
        borderColor: COLORS.tungfamGrey,
        margin: 4,
        padding: 10
    },
    infoContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        margin: 0,
        padding: 0
    },
    infoBlock: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.tungfamGrey,
        borderRadius: 5,
        marginBottom: 6,
        paddingHorizontal: 6,
        paddingVertical: 4,
        margin: 0,
        backgroundColor: 'lightgrey',
        elevation: 5
    },
    blockContainer: {
        flexDirection: 'column',
        // borderWidth: 1,
        // borderColor: COLORS.tungfamGrey,
        margin: 0,
        padding: 0
    },
    infoHeader: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: "center",
        margin: 0,
        padding: 0,
    },
    infoText: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: "center",
        margin: 0,
        padding: 0
    },
    formContainer: {
        alignItems: 'center',
        margin: 0,
        padding: 0,
    },
    tableContainer: {
        margin: 0,
        padding: 0,
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: COLORS.tungfamGrey,
        backgroundColor: COLORS.TungfamBgColor,
        elevation: 5
    },
    tableBody: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: COLORS.tungfamGrey,
        elevation: 5
    },
    columnHeader: {
        flex: 1,
        fontWeight: 'bold',
        fontSize: 18,
        color: 'white'
    },
    columnItem: {
        flex: 1,
        fontWeight: '500',
        fontSize: 16,
    },
    paymentHeader: {
        flex: 1,
        fontWeight: 'bold',
        fontSize: 18,
        marginTop: 16,
    },
    tableInput: {
        flexDirection: "column",
        marginTop: 10,
        justifyContent: 'space-between',
        width: '100%',
        borderWidth: 1,
        borderColor: 'grey',
        borderRadius: 5,
        padding: 10,
        // backgroundColor: 'green'
        marginBottom: 40,
    },
    DatePayment: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-between',
    },
    dateButton: {
        backgroundColor: COLORS.TungfamBgColor,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'grey',
        borderRadius: 5,
        margin: 0,
        padding: 0,
        elevation: 5
    },
    button: {
        color: 'white',
        fontSize: 16,
    },
    paymentPicker: {
        flex: 1,
        borderWidth: 1,
        borderColor: 'grey',
        borderRadius: 5,
        backgroundColor: "lightgrey",
        elevation: 5
    },
    descriptionInput: {
        flex: 2,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        height: 60,
        marginVertical: 10,
    },
    addPaymentButton: {
        fontSize: 16,
        backgroundColor: COLORS.TungfamBgColor,
        color: 'white',
        borderRadius: 5,
        padding: 14,
        textAlign: 'center',
        flex: 1,
        elevation: 5
    },
    evenRow: {
        backgroundColor: COLORS.tungfamPurple,
    },
    oddRow: {
        backgroundColor: 'lightblue',
    },
});

export default PaymentScheduleScreen;
