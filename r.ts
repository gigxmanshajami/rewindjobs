// // @ts-nocheck 
// import { NextResponse } from 'next/server';
// import { parse } from 'cookie';

// function getTokenFromCookies(req) {
//   const cookies = parse(req.headers.get('cookie') || '');
//   return cookies.token || null;  // Return the token if it exists in cookies
// }

// export async function middleware(req: any) {
//   const { pathname } = req.nextUrl;

//   // Check if the user is authenticated by checking for the token in cookies
//   const token = getTokenFromCookies(req);

//   // If no token and trying to access protected pages (like /profile), redirect to login
//   if (!token && pathname === '/profile') {
//     return NextResponse.redirect(new URL('/signin', req.url)); // Redirect to login page
//   }

//   // If token exists and trying to access login or registration page, redirect to profile
//   if (token && (pathname === '/signin' || pathname === '/registration')) {
//     return NextResponse.redirect(new URL('/profile', req.url)); // Redirect to profile page
//   }

//   return NextResponse.next(); // Continue with the request
// }
