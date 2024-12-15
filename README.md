# SupaSketch

![alt text](image.png)

<div align="center" >

![NextJs](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Supabase](https://shields.io/badge/supabase-black?logo=supabase&style=for-the-badge)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-black?logo=googlegemini&style=for-the-badge)](#)

  </div>
  <p align="center">
    <br/>
    <a href="https://supasketch.vercel.app/">View Demo</a>
    .
    <a href="https://github.com/swymbnsl/supasketch/issues">Report Bug</a>
    .
    <a href="https://github.com/swymbnsl/supasketch/issues">Request Feature</a>
  </p>
</p>

## Table Of Contents

- [Table Of Contents](#table-of-contents)
- [About The Project](#about-the-project)
- [Where is Supabase Used](#where-is-supabase-used)
- [Built With](#built-with)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Local](#local)
- [User Guide](#user-guide)
  - [Visit SupaSketch](#visit-supasketch)
- [Authors](#authors)

## About The Project

**SupaSketch** is a multiplayer drawing app powered by **Supabase** and **Gemini AI**. It brings creativity and fun together, allowing users to create rooms, invite friends, and participate in timed drawing challenges. With AI-generated prompts and an AI-powered scoring system, SupaSketch adds a competitive twist to collaborative art. Perfect for friendly competitions, it’s a playful way to express your artistic side!

## Where Is Supabase Used

SupaBase is used in SupaSketch for:

- **Realtime Database** for storing game details
- **Presence Tracking** for room feature
- **Cron Jobs** for deleting completed games and images
- **Storage bucket** for uploading sketches

## Built With

SupaSketch is built using NextJs

- [NextJS](https://nextjs.org)
- [TailwindCss](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)
- [Gemini Ai](https://ai.google.dev/)

## Getting Started

### Installation

### Local

`Rename .env.example to .env.local and fill the required fields`

```bash
git clone https://github.com/swymbnsl/supasketch.git
```

```
cd supasketch
```

```
npm install
```

```
npm run dev
```

Server will start at http://localhost:3000/

## User Guide

### Landing page

This is where the user lands through https://supasketch.vercel.app.
Click on any button to start joining a room

![alt](https://github.com/expenboard/assets/image.png)

### Join or Create room

Once you reach on /join, choose whether you want to create a room or join an existing one.

<br>
Now the room creator can share the room code with the other player

![alt](https://github.com/expenboard/assets/image-1.png)

Once the other player is ready, player1 will be allowed to start the game

![alt](https://github.com/expenboard/assets/image-2.png)

![alt](https://github.com/expenboard/assets/image-3.png)

### Sketch and Compete

Do your best to draw a fun drawing within the 2 minutes of time and emerge victorious!

![alt](https://github.com/expenboard/assets/image-8.png)

### Results

After both the sketches are submitted, let AI decide who emerged victorious

![alt](https://github.com/expenboard/assets/image-9.png)

## Authors

- **Swayam Bansal** - [Swayam Bansal](https://github.com/swymbnsl) - _SupaSketch_
