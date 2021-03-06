import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';

@Injectable()

export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
	constructor() {
		const url = 'https://api.liteseoul.com';
		super({
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			// callbackURL: `http://localhost:80/google/auth/google/callback`, // ======================================================================== URL POINT
			callbackURL: `https://api.liteseoul.com/google/auth/google/callback`,
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
