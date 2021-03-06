/**
* @Author: Nicolas Fazio <webmaster-fazio>
* @Date:   25-12-2016
* @Email:  contact@nicolasfazio.ch
* @Last modified by:   webmaster-fazio
* @Last modified time: 29-12-2016
*/

import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions, Response} from '@angular/http';

import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import 'rxjs/Rx';

const STORAGE_ITEM:string = 'authTokenTest';
/*
  Generated class for the Auth provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/

@Injectable()
export class AuthService {

  private authUrl:string = "http://localhost:8080/auth"
  private isAuthUrl:string = "http://localhost:8080/isauth"
  private signUpUrl:string = "http://localhost:8080/signup"

  private loggedIn:boolean = false;
  private logger:Subject<boolean> = new Subject<boolean>();

  constructor(public http: Http) {
  }

  /* Methode to check if user is currenty loged with jwt */
  isAuth(): Observable<boolean> {
    let storage:any = JSON.parse(localStorage.getItem(STORAGE_ITEM))
    // if storage not found
    if(!storage){
      this.loggedIn = false;
      this.logger.next(this.loggedIn);
      return this.logger.asObservable();
    }
    // If storage is found
    //console.log('token-> ', storage.token)
    // Define Heders request
    let headers:Headers = new Headers({'cache-control': 'no-cache','x-access-token': storage.token});
    let options:RequestOptions = new RequestOptions({ headers: headers });
    // send request to Auth service
    this.http.get(this.isAuthUrl, options)
             .map(res => res.json())
             .catch(this.handleError)
             .subscribe((result)=>{
                 if(result._id) {
                     console.log('subscribe-> ', result._id)
                     this.loggedIn = true;
                     this.logger.next(this.loggedIn);
                     return
                 }
                 // if no _id send event with default value // false
                 this.logger.next(this.loggedIn);
                 return
               },
               err => {
                 this.loggedIn = false;
                 let errorMsg = err[0]
                 this.logger.next(err);
               }
             );
    return this.logger.asObservable();
  }

  /* Token managers Methodes */
  saveToken(providerResponse: string):void {
    localStorage.setItem(STORAGE_ITEM, providerResponse);
    this.loggedIn = true;
    this.logger.next(this.loggedIn);
  }

  dellToken():void {
    localStorage.removeItem(STORAGE_ITEM);
    this.loggedIn = false;
    this.logger.next(this.loggedIn);
  }

  /* Methode to log the user with name & password coming from loginForm */
  loginUser(user): Observable<any> {
    let headers:Headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'});
    let options:RequestOptions = new RequestOptions({ headers: headers });

    let userReady:string = `email=${user.email}&password=${user.password}`;
    //console.log('UserReady-> ', userReady)
    // Post request with data & headers
    return this.http.post(this.authUrl, userReady, options)
                    .map(this.extractData)
                    .catch(this.handleError);
  }

  /* Methode to registre the user with name & password coming from signupForm */
  signUp(user): Observable<any> {
    // Formate data as string
    let body:string = JSON.stringify(user);
    let headers:Headers = new Headers({'Content-Type': 'application/json'});
    // Post request with data & headers
    return this.http.post(this.signUpUrl, body, {headers: headers})
                    .map(this.extractData)
                    .catch(this.handleError);
  }

  /* Methode to formate data output */
  extractData(res: Response):void {
      let body = res.json();
      //return body.data || { };
      return body || {};
  }

  /* Methode to handleError for Observable and return error as observable */
  handleError (error: Response | any):Observable<any> {
    //console.log('err-> ', error)
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    //console.error(errMsg);
    return Observable.throw(errMsg);
  }

}
