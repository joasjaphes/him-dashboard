import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as crypto from 'crypto-js';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  async authenticate(options: any) {
    try {
      return await firstValueFrom(this.http.get(`${options.apiURL}/authenticate/${options.username}`))
    }catch(e) {
      throw e;
    }
  }

  async genAuthHeaders(options: any) {
    const authDetails: any = await this.authenticate(options);

    const salt = authDetails.salt;
    const now = new Date().toISOString();

    // create passhash
    // let shasum = crypto.createHash('sha512');
    let shasum = crypto.SHA512(salt + options.password);
    // shasum.concat(salt + options.password)
    // shasum.update(salt + options.password);
    
    // const passhash = shasum.digest('hex');
    const passhash:any = shasum.toString();

    // create token
    shasum = crypto.SHA512(passhash + salt + now);
    // shasum = crypto.createHash('sha512');
    // shasum.concat(passhash + salt + now);
    // shasum.update(passhash + salt + now);
    // const token = shasum.digest('hex');
    const token = shasum.toString();

    // define request headers with auth credentials
    return {
      'auth-username': options.username,
      'auth-ts': now,
      'auth-salt': salt,
      'auth-token': token,
    };
  }
}
