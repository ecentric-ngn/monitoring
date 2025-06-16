import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { api_url, fileUpload_api, userTrainingView } from '../app.const/const';
import { NavigationExtras } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserTrainingService {

  constructor(private http:HttpClient) { }
//add user training form
  addUserTrainingData(trainingDetails:any){
    return this.http.post<any>(`${api_url}/saveTraining`,trainingDetails)
  }
  updateUserTrainingData(trainingDetails:any,id:any){
    return this.http.patch<any>(`${api_url}/updateTraining/${id}`,trainingDetails)
  }
  //save paerticpant
  saveUserParticipant(trainingDetails:any){
    return this.http.post<any>(`${api_url}/createTrainingParticipant`,trainingDetails)
  }
//uploading file
uploadFile(file:File){
  const formData: FormData = new FormData();
  formData.append("file", file);
  return this.http.post(`${fileUpload_api}/file/upload`, formData, { responseType: 'text' });
}
//getting list of usertraing data
GetTrainingData(trainingDetails){
  return this.http.post<any>(`${userTrainingView}/view`,trainingDetails)
}
GetParticipantData(trainingDetails){
  return this.http.post<any>(`${userTrainingView}/view`,trainingDetails)
}
  // Shared service method to set the tender ID and navigate to the specified route
  setData(data: any, propertyName: string, route: string) {
    // Create an object with the dynamic property name and ID
    const stateObj = { [propertyName]: data };
   
    // Create NavigationExtras with the state object
    const navigationExtras: NavigationExtras = {
      state: stateObj
    
    }
  }
    updateParticipantData(trainingDetails:any){
  return this.http.post<any>(`${api_url}/createTrainingParticipant`,trainingDetails)
}
// Delete participant data
deleteParticipantData(id: any) {
  return this.http.delete(`${api_url}/deleteTrainingParticipant/${id}`, {
    responseType: 'text', 
   
  });
}
    // Shared service method to get the data using the provided property name
  getData(propertyName: string): any {
    return history.state[propertyName];
  }
  
}

