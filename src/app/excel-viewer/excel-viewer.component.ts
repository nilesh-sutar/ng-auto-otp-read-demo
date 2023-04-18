import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-excel-viewer',
  templateUrl: './excel-viewer.component.html',
  styleUrls: ['./excel-viewer.component.css']
})
export class ExcelViewerComponent implements OnInit {
  constructor(private http: HttpClient) {}

  ngOnInit(){

    this.uploadExcelToGoogleSheet().then(result => {
      console.log(result)
    })
  }

  async uploadExcelToGoogleSheet() {
    const url = 'https://s3.ap-south-1.amazonaws.com/dev-uploads.taxbuddy.com/6039/Common/TaxBuddy%20Cg%20Template.xlsx'; // Replace with your CDN URL
    const response = await this.http.get(url, { responseType: 'arraybuffer' }).toPromise();
    const workbook = XLSX.read(response, { type: 'array' });

    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

    // Replace with your own Google Sheets API credentials
    const apiKey = 'AIzaSyDAxKkANa0kAelPraP5ow9oS3arMa-aeFU';
    const accessToken = `ya29.a0Ael9sCNM0m2Hyh2BqYDUkUPXNTYxb-1CPb8KmnrLpZs9AbZiz6QEc5Ptb00MX0a7U8Q6L7h1FNTJYzutRVvL5t4eKgDAZDSHLKljTS7dqPKAUA4_bVPe0WoZ2MzT3xekYraO8rQ67O4s-sD5hxThu0qKGSLRaCgYKAboSARASFQF4udJhX6sdnQVs4jePG70h68sKkw0163`;

    let createSheetResponse:any = await this.http.post(`https://sheets.googleapis.com/v4/spreadsheets?key=${apiKey}`, {}, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }).toPromise();
    const spreadsheetId = createSheetResponse['spreadsheetId'];

    const updateSheetResponse = await this.http.put(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?valueInputOption=USER_ENTERED`, {
      range:  sheetName + ` Class Data!A2:E`,
      majorDimension: 'ROWS',
      values: sheetData
    }, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }).toPromise()

    console.log('Uploaded Excel file to Google Sheets');
  }
}
