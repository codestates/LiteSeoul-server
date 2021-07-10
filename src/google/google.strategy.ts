import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';

@Injectable()

export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
	constructor() {
		
		// http://ec2-52-79-247-245.ap-northeast-2.compute.amazonaws.com
		const url = 'https://liteseoul.com';
		// const url = 'http://localhost:3000';
		super({
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: `${url}`,
			// callbackURL: `${url}/google/auth/google/callback`,
			// callbackURL: 'https://api.liteseoul.com/google/auth/google/callback',
			// callbackURL: 'http://ec2-52-79-247-245.ap-northeast-2.compute.amazonaws.com/google/auth/google/callback',
			scope: ['email', 'profile']
		});
	}
	
	// 없으면 안 됨...
	async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
		const { name, emails, photos } = profile;
		const user = {
			email: emails[0].value,
			firstName: name.givenName,
			lastName: name.familyName,
			picture: photos[0].value,
			accessToken
		}
		done(null, user);
	}
}
