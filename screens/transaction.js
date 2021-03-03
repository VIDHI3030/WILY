import React from 'react';
import {Text,View,TouchableOpacity,StyleSheet,Image, TextInput,KeyboardAvoidingView,ToastAndroid,Alert} from 'react-native';
import * as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner';
import firebase from 'firebase';
import db from '../config';
import { color } from 'react-native-reanimated';
export default class Transactionscreen extends React.Component{
  constructor(){
    super();
    this.state={
      hasCameraPermission:null,
      scan:false,
      buttonState:'normal',
      scanBookId:'',
      scanStudentId:'',
      transactionmessage:'',
    }
  }
  getCameraPermissions=async(id)=>{
    const {status}=await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      hasCameraPermission:status=="granted",
      scan:false,
      buttonState:id
    })
    console.log(this.state.hasCameraPermission)
  }
  handleBarcodeScan=async({type,data})=>{
    const {buttonState}=this.state
    if(buttonState=="bookId"){
      this.setState({
        scan:true,
        scanBookId:data,
        buttonState:'normal'
      })  
    } else if(buttonState=="studentId"){
      this.setState({
        scan:true,
        scanStudentId:data,
        buttonState:'normal'

      })  
    }
  }
  initiateBookIssue=async()=>{
    db.collection("transaction").add({
      'studentId':this.state.scanStudentId,
      'bookId':this.state.scanBookId,
      'date':firebase.firestore.Timestamp.now().toDate(),
      'transactionType':'issue',
    })
    db.collection("books").doc(this.state.scanBookId).update({bookAvailablity:false});
    db.collection("students").doc(this.state.scanStudentId).update({
      numberOfBooksIssued:firebase.firestore.FieldValue.increment(1)
    })
    this.setState({
      scanStudentId:'',
      scanBookId:''
    })
  }
  initiateBookReturn=async()=>{
    db.collection("transaction").add({
      'studentId':this.state.scanStudentId,
      'bookId':this.state.scanBookId,
      'date':firebase.firestore.Timestamp.now().toDate(),
      'transactionType':'return',
    })
    db.collection("books").doc(this.state.scanBookId).update({bookAvailablity:true});
    db.collection("students").doc(this.state.scanStudentId).update({
      numberOfBooksIssued:firebase.firestore.FieldValue.increment(-1)
    })
    this.setState({
      scanStudentId:'',
      scanBookId:''
    })
  }
  handleTransaction=async()=>{
    var transactionmessage=null;
    db.collection("books").doc(this.state.scanBookId).get().then((doc)=>{
      var book=doc.data();
      if(book.bookAvailablity){
        this.initiateBookIssue();
        transactionmessage="book issued"
        Alert.alert(transactionmessage)
      }
      else {
        this.initiateBookReturn();
        transactionmessage='book returned'
        Alert.alert(transactionmessage)
      }
      this.setState({
        transactionmessage:transactionmessage
      })
    })
  }
  
  render(){
    const hasCameraPermission=this.state.hasCameraPermission;
    const scan =this.state.scan;
    const buttonState=this.state.buttonState;
    if(buttonState=="normal"&& hasCameraPermission){
      return(
        <BarCodeScanner 
        onBarCodeScanned={scan? undefined: this.handleBarcodeScan}
        style={StyleSheet.absoluteFillObject}/>

      )
    } else if(buttonState=="normal"){
       return(
         <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
          <View style={{flex:1, justifyContent:"center",alignItems:"center"}}>
            <Image source={require('../assets/booklogo.jpg')} style={{width:200,height:200}}/>
            <Text style={{
              textAlign:'center',
              fontSize:30,
              color:'blue'
            }}>WILY</Text>
           <View style={{
             flexDirection:'row',
             margin:20
             }}>
             <TextInput style={styles.InputBox} placeholder="book Id"onChangeText ={text=>this.setState({scanBookId:text})}value={this.state.scanBookId}>
             </TextInput>
             <TouchableOpacity onPress={this.getCameraPermissions("bookId")} style={styles.scanButton}>
            <Text style={styles.buttomText}> scan </Text>
          </TouchableOpacity>
           </View>
           <View style={{
             flexDirection:'row',
             margin:20
             }}>
             <TextInput style={styles.InputBox} placeholder="Student Id" onChangeText ={text=>this.setState({scanStudentId:text})} value={this.state.scanStudentId}>
             </TextInput>
             <TouchableOpacity onPress={this.getCameraPermissions("studentId")} style={styles.scanButton}>
            <Text style={styles.buttomText}> scan </Text>
          </TouchableOpacity>
           </View>
          <View>
            <Text>{this.state.transactionmessage}</Text>
            <TouchableOpacity style={styles.scanButton} 
            onPress={async()=>{var transactionmessage=await this.handleTransaction()}}>
              <Text style={styles.display}>submit</Text>
            </TouchableOpacity>
          </View>
          </View>
          </KeyboardAvoidingView>
       )
    }
    
  }

}
const styles=StyleSheet.create({
  container:{
    flex:1,
    justifyContent:'center',
    alignItems:'center',
  },
  display:{
    fontSize:15,
    textDecorationLine:'underline',
  },
  scanButton:{
    backgroundColor:'#2196f3',
       borderWidth:1.5,
      borderLeftWidth:0
    },
  buttomText:{
    fontSize:20,
    fontWeight:'bold',
  
  },
  InputBox:{
    width:200,
    height:40,
    borderWidth:1.5,
    borderRightWidth:0,
    fontSize:20
  }

})